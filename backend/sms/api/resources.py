"""Explicit API fields and model-backed validation for the staff portal."""

import math
from dataclasses import dataclass

from django import forms
from django.forms import modelform_factory

from Admin.models import Admin
from Group.models import Group
from Scores.models import Score
from Teachers.models import Teacher
from exam.models import Exam
from student.models import Student


class ResourceForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Several legacy nullable foreign keys omit blank=True. The API allows
        # clearing them because the database and deletion behavior allow null.
        for name, field in self.fields.items():
            if self._meta.model._meta.get_field(name).null:
                field.required = False

    def clean(self):
        cleaned = super().clean()
        note = cleaned.get('note')
        if note is not None and not math.isfinite(note):
            self.add_error('note', 'Enter a finite number.')
        return cleaned


@dataclass(frozen=True)
class Resource:
    model: type
    fields: tuple
    relations: tuple = ()
    readonly: bool = False

    def form(self, data, instance=None):
        form_class = modelform_factory(self.model, form=ResourceForm, fields=self.fields)
        return form_class(data=data, instance=instance)

    def queryset(self):
        return self.model.objects.select_related(*self.relations).order_by(self.model._meta.pk.name)

    def serialize(self, instance):
        record = {instance._meta.pk.name: instance.pk}
        for name in self.fields:
            field = instance._meta.get_field(name)
            record[name] = getattr(instance, field.attname)
        for name in self.relations:
            related = getattr(instance, name)
            record[f'{name}_name'] = (
                getattr(related, 'fullname', getattr(related, 'name', None))
                if related is not None else None
            )
        if isinstance(instance, Score):
            record['created_at'] = instance.created_at
        return record


RESOURCES = {
    'students': Resource(Student, ('fullname', 'address', 'date_of_inscription', 'admin', 'group'), ('admin', 'group')),
    'teachers': Resource(Teacher, ('fullname', 'adress', 'date_of_inscription', 'admin'), ('admin',)),
    'groups': Resource(Group, ('name', 'year_of_creation', 'admin', 'teacher'), ('admin', 'teacher')),
    'exams': Resource(Exam, ('name', 'place', 'date_hour', 'teacher', 'group'), ('teacher', 'group')),
    'scores': Resource(Score, ('student', 'teacher', 'exam', 'admin', 'note'), ('student', 'teacher', 'exam', 'admin')),
    'admins': Resource(Admin, ('fullname', 'address', 'date_of_inscription'), readonly=True),
}
