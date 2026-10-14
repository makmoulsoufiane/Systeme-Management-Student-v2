from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from Admin.models import Admin
from Group.models import Group
from Scores.models import Score
from Teachers.models import Teacher
from exam.models import Exam
from student.models import Student


class StaffApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = get_user_model().objects.create_user('staff', password='test-password', is_staff=True)
        cls.member = get_user_model().objects.create_user('member', password='test-password')
        cls.admin = Admin.objects.create(fullname='School administrator', address='Main office', date_of_inscription='2025-01-01')
        cls.teacher = Teacher.objects.create(fullname='Amina', adress='Rabat', date_of_inscription='2025-01-01', admin=cls.admin)
        cls.group = Group.objects.create(name='Physics', year_of_creation=2025, admin=cls.admin, teacher=cls.teacher)
        cls.student = Student.objects.create(fullname='Samira', address='Casablanca', date_of_inscription='2025-01-02', admin=cls.admin, group=cls.group)
        cls.exam = Exam.objects.create(name='Midterm', place='Room 1', date_hour='2026-10-15T10:00:00Z', teacher=cls.teacher, group=cls.group)

    def setUp(self):
        self.client.force_login(self.staff)

    def write(self, method, url, payload):
        return getattr(self.client, method)(url, payload, content_type='application/json')

    def test_resources_require_authenticated_staff(self):
        self.client.logout()
        for resource in ('students', 'teachers', 'groups', 'exams', 'scores', 'admins'):
            with self.subTest(resource=resource):
                self.assertEqual(self.client.get(f'/api/{resource}/').status_code, 401)
        self.client.force_login(self.member)
        self.assertEqual(self.client.get('/api/students/').status_code, 403)
        session = self.client.get('/api/session/')
        self.assertEqual(session.status_code, 200)
        self.assertIsNone(session.json()['user'])
        self.assertTrue(session.json()['csrfToken'])
        response = self.write('post', '/api/login/', {'username': 'staff', 'password': 'test-password'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get('/api/students/').status_code, 200)

    def test_login_logout_and_csrf_enforcement(self):
        client = Client(enforce_csrf_checks=True)
        response = client.get('/api/session/')
        self.assertIsNone(response.json()['user'])
        token = response.json()['csrfToken']
        credentials = {'username': 'staff', 'password': 'test-password'}
        missing_token = client.post('/api/login/', credentials, content_type='application/json')
        self.assertEqual(missing_token.status_code, 403)
        self.assertIn('message', missing_token.json())
        signed_in = client.post('/api/login/', credentials, content_type='application/json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(signed_in.status_code, 200)
        self.assertEqual(signed_in.json()['user']['username'], 'staff')
        self.assertEqual(client.get('/api/students/').status_code, 200)
        self.assertEqual(client.patch(f'/api/students/{self.student.pk}/', '{}', content_type='application/json').status_code, 403)
        signed_out = client.post('/api/logout/', HTTP_X_CSRFTOKEN=signed_in.json()['csrfToken'])
        self.assertEqual(signed_out.status_code, 200)
        self.assertIsNone(signed_out.json()['user'])
        self.assertEqual(client.get('/api/students/').status_code, 401)

    def test_login_rejects_invalid_and_nonstaff_credentials(self):
        self.client.logout()
        for username, password, status in [('staff', 'wrong', 401), ('member', 'test-password', 403)]:
            response = self.write('post', '/api/login/', {'username': username, 'password': password})
            self.assertEqual(response.status_code, status)
        self.assertEqual(self.client.get('/api/students/').status_code, 401)

    def test_all_resource_lists_preserve_identifiers_and_relationship_labels(self):
        score = Score.objects.create(student=self.student, teacher=self.teacher, exam=self.exam, admin=self.admin, note=17.5)
        expected = {
            'students': ('id_student', self.student.pk), 'teachers': ('id_teacher', self.teacher.pk),
            'groups': ('id_group', self.group.pk), 'exams': ('id_exam', self.exam.pk),
            'scores': ('id', score.pk), 'admins': ('id_admin', self.admin.pk),
        }
        for name, (key, value) in expected.items():
            records = self.client.get(f'/api/{name}/').json()['results']
            self.assertEqual(records[0][key], value)
        student = self.client.get(f'/api/students/{self.student.pk}/').json()['record']
        self.assertEqual(student['group'], self.group.pk)
        self.assertEqual(student['group_name'], 'Physics')
        self.assertEqual(self.client.get('/api/teachers/').json()['results'][0]['adress'], 'Rabat')

    def test_create_patch_and_delete_student(self):
        response = self.write('post', '/api/students/', {
            'fullname': 'New Student', 'address': 'Fes', 'date_of_inscription': '2026-10-14',
            'admin': self.admin.pk, 'group': self.group.pk,
        })
        self.assertEqual(response.status_code, 201, response.content)
        student_id = response.json()['record']['id_student']
        patched = self.write('patch', f'/api/students/{student_id}/', {'fullname': 'Updated Student'})
        self.assertEqual(patched.status_code, 200, patched.content)
        self.assertEqual(patched.json()['record']['fullname'], 'Updated Student')
        self.assertEqual(patched.json()['record']['address'], 'Fes')
        self.assertEqual(self.client.delete(f'/api/students/{student_id}/').status_code, 204)
        self.assertFalse(Student.objects.filter(pk=student_id).exists())

    def test_create_other_editable_resources_with_nullable_relations(self):
        payloads = {
            'teachers': {'fullname': 'New Teacher', 'adress': 'Fes', 'date_of_inscription': '2026-10-14', 'admin': None},
            'groups': {'name': 'Literature', 'year_of_creation': 2026, 'admin': self.admin.pk, 'teacher': None},
            'exams': {'name': 'Final', 'place': 'Room 2', 'date_hour': '2026-10-16T09:00:00Z', 'group': None, 'teacher': None},
            'scores': {'student': self.student.pk, 'note': 14.5, 'teacher': None, 'exam': None, 'admin': None},
        }
        for resource, payload in payloads.items():
            with self.subTest(resource=resource):
                response = self.write('post', f'/api/{resource}/', payload)
                self.assertEqual(response.status_code, 201, response.content)

    def test_validation_returns_field_errors(self):
        invalid = self.write('post', '/api/students/', {'fullname': 'Incomplete'})
        self.assertEqual(invalid.status_code, 400)
        self.assertIn('address', invalid.json()['errors'])
        missing_group = self.write('patch', f'/api/students/{self.student.pk}/', {'group': 99999})
        self.assertEqual(missing_group.status_code, 400)
        self.assertIn('group', missing_group.json()['errors'])
        duplicate_teacher = self.write('post', '/api/groups/', {'name': 'Other', 'year_of_creation': 2026, 'admin': self.admin.pk, 'teacher': self.teacher.pk})
        self.assertEqual(duplicate_teacher.status_code, 400)
        self.assertIn('teacher', duplicate_teacher.json()['errors'])
        invalid_year = self.write('patch', f'/api/groups/{self.group.pk}/', {'year_of_creation': -1})
        self.assertEqual(invalid_year.status_code, 400)

    def test_rejects_nonfinite_scores_and_nested_values(self):
        for note in ('NaN', 'Infinity', '-Infinity', {'unexpected': 'object'}):
            response = self.write('post', '/api/scores/', {'student': self.student.pk, 'note': note})
            self.assertEqual(response.status_code, 400)
            self.assertIn('note', response.json()['errors'])

    def test_rejects_cascading_deletion_and_preserves_data(self):
        response = self.client.delete(f'/api/groups/{self.group.pk}/')
        self.assertEqual(response.status_code, 409)
        self.assertTrue(Student.objects.filter(pk=self.student.pk).exists())
        score = Score.objects.create(student=self.student, note=12)
        self.assertEqual(self.client.delete(f'/api/students/{self.student.pk}/').status_code, 409)
        self.assertTrue(Score.objects.filter(pk=score.pk).exists())

    def test_deletion_allows_set_null_relationship(self):
        teacher = Teacher.objects.create(fullname='Visiting teacher', adress='Fes', date_of_inscription='2026-01-01')
        score = Score.objects.create(student=self.student, teacher=teacher, note=12)
        self.assertEqual(self.client.delete(f'/api/teachers/{teacher.pk}/').status_code, 204)
        score.refresh_from_db()
        self.assertIsNone(score.teacher)

    def test_admin_lookup_readonly_and_missing_records(self):
        self.assertEqual(self.write('post', '/api/admins/', {}).status_code, 405)
        self.assertEqual(self.client.delete(f'/api/admins/{self.admin.pk}/').status_code, 405)
        self.assertEqual(self.client.get('/api/students/99999/').status_code, 404)
        self.assertEqual(self.client.get('/api/unknown/').status_code, 404)

    def test_malformed_json_and_readonly_fields(self):
        self.assertEqual(self.client.post('/api/students/', 'broken', content_type='application/json').status_code, 400)
        self.assertEqual(self.client.post('/api/students/', '[]', content_type='application/json').status_code, 400)
        response = self.write('patch', f'/api/students/{self.student.pk}/', {'id_student': 100})
        self.assertEqual(response.status_code, 400)
        self.assertIn('id_student', response.json()['errors'])
