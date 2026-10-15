from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from Admin.models import Admin
from Group.models import Group
from Scores.models import Score
from Teachers.models import Teacher
from student.models import Student
from exam.models import Exam
from .models import StudentProfile, TeacherProfile
from .serializers import LoginSerializer

User = get_user_model()
PASSWORD = 'Testing-password-729!'


class RoleAccessTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser('admin', password=PASSWORD, must_change_password=False)
        owner = Admin.objects.create(fullname='Office', address='School', date_of_inscription='2026-01-01')
        cls.users, cls.teachers, cls.students, cls.groups, cls.exams, cls.scores = [], [], [], [], [], []
        for index in range(2):
            teacher = Teacher.objects.create(fullname=f'Teacher {index}', adress='School', date_of_inscription='2026-01-01', admin=owner)
            group = Group.objects.create(name=f'Class {index}', year_of_creation=2026, teacher=teacher, admin=owner)
            student = Student.objects.create(fullname=f'Student {index}', address='School', date_of_inscription='2026-01-01', group=group, admin=owner)
            exam = Exam.objects.create(name=f'Exam {index}', date_hour='2026-10-15T10:00:00Z', place='School', teacher=teacher, group=group)
            score = Score.objects.create(student=student, teacher=teacher, exam=exam, note=15)
            teacher_user = User.objects.create_user(f'teacher{index}', password=PASSWORD, role='teacher', must_change_password=False)
            student_user = User.objects.create_user(f'student{index}', password=PASSWORD, role='student', must_change_password=False)
            TeacherProfile.objects.create(user=teacher_user, teacher=teacher)
            StudentProfile.objects.create(user=student_user, student=student)
            cls.users.append((teacher_user, student_user))
            cls.teachers.append(teacher); cls.students.append(student); cls.groups.append(group); cls.exams.append(exam); cls.scores.append(score)
        cls.owner = owner

    def setUp(self):
        self.client = APIClient()

    def authorize(self, user):
        token = LoginSerializer.get_token(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        return token

    def test_login_contract_all_roles_no_public_registration(self):
        for user in (self.admin, *self.users[0]):
            response = self.client.post('/api/auth/login/', {'username': user.username, 'password': PASSWORD}, format='json')
            self.assertEqual(response.status_code, 200, response.data)
            for field in ('access', 'refresh', 'role', 'username', 'must_change_password', 'user'):
                self.assertIn(field, response.data)
            self.assertEqual(response.data['role'], user.role)
        self.assertEqual(self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'wrong'}, format='json').status_code, 401)
        self.assertEqual(self.client.post('/api/register/', {}).status_code, 401)
        for path in ['/api/admin/teachers/', '/api/admin/students/', '/api/students/', '/api/auth/change-password/']:
            self.assertEqual(self.client.post(path, {}, format='json').status_code, 401)

    def test_teacher_and_student_lists_and_detail_ids_are_scoped(self):
        for user in self.users[0]:
            self.authorize(user)
            for resource, records, key in [('students', self.students, 'id_student'), ('groups', self.groups, 'id_group'), ('exams', self.exams, 'id_exam'), ('scores', self.scores, 'id')]:
                with self.subTest(role=user.role, resource=resource):
                    response = self.client.get(f'/api/{resource}/')
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual([record[key] for record in response.data['results']], [records[0].pk])
                    self.assertEqual(self.client.get(f'/api/{resource}/{records[1].pk}/').status_code, 404)
                    self.assertEqual(self.client.get(f'/api/{resource}/{records[0].pk}/').status_code, 200)
            self.assertEqual(self.client.get('/api/admins/').data['results'], [])
            for path in ['/api/admin/teachers/', '/api/admin/students/', f'/api/admin/students/{self.users[1][1].pk}/']:
                self.assertEqual(self.client.get(path).status_code, 403)
                self.assertEqual(self.client.post(path, {}, format='json').status_code, 403)
                self.assertEqual(self.client.patch(path, {'is_active': False}, format='json').status_code, 403)
            for method, path in [('post', '/api/students/'), ('patch', f'/api/students/{self.students[0].pk}/'), ('delete', f'/api/students/{self.students[0].pk}/')]:
                self.assertEqual(getattr(self.client, method)(path, {}, format='json').status_code, 403)
        self.assertEqual(self.client.get('/api/teachers/').data['results'], [])

    def test_teacher_creates_exams_and_scores_only_for_assigned_class(self):
        self.authorize(self.users[0][0])
        exam_payload = {'name': 'New exam', 'place': 'Room 1', 'date_hour': '2026-11-01T10:00:00Z', 'group': self.groups[0].pk}
        response = self.client.post('/api/exams/', exam_payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        exam = Exam.objects.get(pk=response.data['record']['id_exam'])
        self.assertEqual(exam.teacher_id, self.teachers[0].pk)
        score_payload = {'student': self.students[0].pk, 'exam': exam.pk, 'note': 17}
        response = self.client.post('/api/scores/', score_payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        score = Score.objects.get(pk=response.data['record']['id'])
        self.assertEqual(score.teacher_id, self.teachers[0].pk)
        self.assertIsNone(score.admin_id)
        for resource, payload, changes, expected in [
            ('exams', exam_payload, {'group': self.groups[1].pk}, 400),
            ('exams', exam_payload, {'group': None}, 400),
            ('exams', exam_payload, {'teacher': self.teachers[1].pk}, 403),
            ('scores', score_payload, {'student': self.students[1].pk}, 400),
            ('scores', score_payload, {'exam': self.exams[1].pk}, 400),
            ('scores', score_payload, {'exam': None}, 400),
            ('scores', score_payload, {'teacher': self.teachers[1].pk}, 403),
            ('scores', score_payload, {'admin': self.owner.pk}, 403),
        ]:
            with self.subTest(resource=resource, changes=changes):
                count = Exam.objects.count() if resource == 'exams' else Score.objects.count()
                response = self.client.post(f'/api/{resource}/', {**payload, **changes}, format='json')
                self.assertEqual(response.status_code, expected, response.data)
                self.assertEqual(Exam.objects.count() if resource == 'exams' else Score.objects.count(), count)
        for resource, record in [('exams', exam), ('scores', score)]:
            self.assertEqual(self.client.patch(f'/api/{resource}/{record.pk}/', {}, format='json').status_code, 403)
            self.assertEqual(self.client.delete(f'/api/{resource}/{record.pk}/').status_code, 403)
        self.authorize(self.users[0][1])
        self.assertEqual(self.client.post('/api/exams/', exam_payload, format='json').status_code, 403)
        self.assertEqual(self.client.post('/api/scores/', score_payload, format='json').status_code, 403)
        orphan = User.objects.create_user('unlinked-teacher', role='teacher', must_change_password=False)
        self.authorize(orphan)
        self.assertEqual(self.client.post('/api/exams/', exam_payload, format='json').status_code, 403)
        self.assertEqual(self.client.post('/api/scores/', score_payload, format='json').status_code, 403)

    def test_missing_profiles_fail_closed_and_forged_roles_are_ignored(self):
        orphan = User.objects.create_user('orphan', password=PASSWORD, role='teacher', must_change_password=False)
        token = self.authorize(orphan)
        token['role'] = 'admin'
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        self.assertEqual(self.client.get('/api/students/').data['results'], [])
        self.assertEqual(self.client.get('/api/admin/students/').status_code, 403)

    def test_admin_create_edit_deactivate_is_atomic_and_role_is_fixed(self):
        self.authorize(self.admin)
        for role, model, profile in [('teacher', Teacher, TeacherProfile), ('student', Student, StudentProfile)]:
            fields = {'fullname': 'New person', 'date_of_inscription': '2026-01-01', 'admin': self.owner}
            fields.update({'adress': 'School'} if role == 'teacher' else {'address': 'School', 'group': self.groups[0]})
            record = model.objects.create(**fields)
            payload = {'username': f'new-{role}', 'password': PASSWORD, 'record_id': record.pk}
            self.assertEqual(self.client.post(f'/api/admin/{role}s/', {**payload, 'role': 'admin'}, format='json').status_code, 400)
            self.assertFalse(User.objects.filter(username=payload['username']).exists())
            response = self.client.post(f'/api/admin/{role}s/', payload, format='json')
            self.assertEqual(response.status_code, 201, response.data)
            self.assertNotIn('password', response.data)
            user = User.objects.get(pk=response.data['id'])
            self.assertEqual(user.role, role)
            self.assertFalse(user.is_staff)
            self.assertTrue(user.must_change_password)
            self.assertTrue(user.check_password(PASSWORD))
            self.assertTrue(profile.objects.filter(user=user).exists())
            duplicate = self.client.post(f'/api/admin/{role}s/', {**payload, 'username': 'duplicate'}, format='json')
            self.assertEqual(duplicate.status_code, 400)
            self.assertFalse(User.objects.filter(username='duplicate').exists())
            path = f'/api/admin/{role}s/{user.pk}/'
            self.assertEqual(self.client.patch(path, {'email': 'updated@example.com'}, format='json').status_code, 200)
            self.assertEqual(self.client.patch(path, {'is_superuser': True}, format='json').status_code, 400)
            self.assertEqual(self.client.patch(path, {'is_active': False}, format='json').status_code, 200)
            user.refresh_from_db()
            self.assertFalse(user.is_active)
            self.assertTrue(model.objects.filter(pk=record.pk).exists())
            self.assertEqual(self.client.delete(f'/api/{role}s/{record.pk}/').status_code, 409)
            self.assertEqual(self.client.delete(path).status_code, 405)

    def test_mandatory_password_change_is_enforced_on_api(self):
        user = self.users[0][1]
        user.must_change_password = True; user.save()
        old = self.authorize(user)
        self.assertEqual(self.client.get('/api/students/').status_code, 403)
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 200)
        path = '/api/auth/change-password/'
        for current, new in [('wrong', 'New-safe-password-730!'), (PASSWORD, '123'), (PASSWORD, PASSWORD)]:
            self.assertEqual(self.client.post(path, {'current_password': current, 'new_password': new}, format='json').status_code, 400)
        response = self.client.post(path, {'current_password': PASSWORD, 'new_password': 'New-safe-password-730!'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertFalse(response.data['must_change_password'])
        self.assertEqual(self.client.get('/api/students/').status_code, 401)
        self.assertEqual(self.client.post('/api/auth/refresh/', {'refresh': str(old)}, format='json').status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')
        self.assertEqual(self.client.get('/api/students/').status_code, 200)
        user.refresh_from_db(); self.assertTrue(user.check_password('New-safe-password-730!'))

    def test_refresh_rotation_logout_and_inactive_sessions(self):
        user = self.users[0][0]
        token = self.authorize(user)
        response = self.client.post('/api/auth/refresh/', {'refresh': str(token)}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.client.post('/api/auth/refresh/', {'refresh': str(token)}, format='json').status_code, 401)
        response = self.client.post('/api/auth/logout/', {'refresh': response.data['refresh']}, format='json')
        self.assertEqual(response.status_code, 204)
        token = self.authorize(user)
        self.authorize(self.admin)
        path = f'/api/admin/teachers/{user.pk}/'
        self.assertEqual(self.client.patch(path, {'is_active': False}, format='json').status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)
        self.assertEqual(self.client.post('/api/auth/refresh/', {'refresh': str(token)}, format='json').status_code, 401)
        self.authorize(self.admin)
        self.assertEqual(self.client.patch(path, {'is_active': True}, format='json').status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)

    def test_cors_allowlist_and_legacy_routes(self):
        for origin, allowed in [('http://localhost:5173', True), ('https://untrusted.example', False)]:
            response = self.client.options('/api/auth/login/', HTTP_ORIGIN=origin, HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST', HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization,content-type')
            self.assertEqual('access-control-allow-origin' in response, allowed)
        for path in ['/admins/', '/students/', '/teachers/']:
            self.assertEqual(self.client.get(path).status_code, 404)
        self.client.force_login(self.users[0][0])
        self.assertEqual(self.client.get('/admin/').status_code, 403)
