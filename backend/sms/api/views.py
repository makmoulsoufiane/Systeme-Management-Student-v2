"""Session-authenticated JSON endpoints; existing HTML routes remain separate."""

import json
from functools import wraps

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, transaction
from django.db.models.deletion import Collector
from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie

from .resources import RESOURCES


def error(message, status=400, errors=None):
    return JsonResponse({'message': message, 'errors': errors or {}}, status=status)


def csrf_failure(request, reason=''):
    return error('Your security token expired. Refresh the page and try again.', 403)


def methods(*allowed):
    def decorate(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            if request.method not in allowed:
                response = error('This method is not supported.', 405)
                response['Allow'] = ', '.join(allowed)
                return response
            return view(request, *args, **kwargs)
        return wrapped
    return decorate


def staff_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return error('Sign in to continue.', 401)
        if not request.user.is_active or not request.user.is_staff:
            return error('A staff account is required.', 403)
        return view(request, *args, **kwargs)
    return wrapped


def session_response(request):
    user = request.user
    return JsonResponse({
        'user': {
            'id': user.pk,
            'username': user.get_username(),
            'display_name': user.get_full_name() or user.get_username(),
        } if user.is_authenticated and user.is_active and user.is_staff else None,
        'csrfToken': get_token(request),
    })


def json_body(request):
    if request.content_type != 'application/json':
        raise ValueError('Send a JSON request body.')
    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ValueError('The request body contains invalid JSON.') from None
    if not isinstance(payload, dict):
        raise ValueError('The request body must be a JSON object.')
    return payload


@never_cache
@ensure_csrf_cookie
@methods('GET')
def session(request):
    # A nonstaff Django session should still be able to open the portal's login
    # page and obtain a token to sign in with a staff account.
    return session_response(request)


@never_cache
@csrf_protect
@methods('POST')
def sign_in(request):
    try:
        payload = json_body(request)
    except ValueError as exc:
        return error(str(exc))
    username, password = payload.get('username'), payload.get('password')
    if not isinstance(username, str) or not isinstance(password, str) or not username or not password:
        return error('Enter your username and password.')
    user = authenticate(request, username=username, password=password)
    if user is None:
        return error('The username or password is incorrect.', 401)
    if not user.is_staff:
        return error('A staff account is required.', 403)
    login(request, user)
    return session_response(request)


@never_cache
@csrf_protect
@methods('POST')
def sign_out(request):
    logout(request)
    return session_response(request)


def save_record(request, resource, instance=None):
    try:
        payload = json_body(request)
    except ValueError as exc:
        return error(str(exc))
    unknown = set(payload) - set(resource.fields)
    if unknown:
        return error('Some fields cannot be changed.', errors={name: ['Unknown or read-only field.'] for name in sorted(unknown)})
    if instance is not None:
        current = resource.serialize(instance)
        payload = {**{name: current[name] for name in resource.fields}, **payload}
    # ModelChoiceField expects scalar IDs; reject nested JSON values cleanly.
    invalid = {name: ['Enter a single value.'] for name, value in payload.items() if isinstance(value, (dict, list, bool))}
    if invalid:
        return error('Please correct the highlighted fields.', errors=invalid)
    form = resource.form(payload, instance)
    if not form.is_valid():
        return error('Please correct the highlighted fields.', errors={name: list(messages) for name, messages in form.errors.items()})
    try:
        with transaction.atomic():
            record = form.save()
    except IntegrityError:
        return error('A related record changed or a unique value is already in use. Refresh and try again.', 409)
    return JsonResponse({'record': resource.serialize(record)}, status=200 if instance else 201)


def delete_record(instance):
    with transaction.atomic():
        collector = Collector(using=instance._state.db)
        collector.collect([instance])
        has_cascade = any(
            record != instance for records in collector.data.values() for record in records
        ) or any(queryset.exists() for queryset in collector.fast_deletes)
        if has_cascade:
            return error('This record has dependent records. Remove or reassign them before deleting it.', 409)
        collector.delete()
    return HttpResponse(status=204)


@never_cache
@staff_required
@methods('GET', 'POST', 'PATCH', 'DELETE')
def records(request, resource_name, record_id=None):
    resource = RESOURCES.get(resource_name)
    if resource is None:
        return error('This resource does not exist.', 404)
    if resource.readonly and request.method != 'GET':
        return error('Administrators are managed in Django admin.', 405)
    if record_id is None:
        if request.method == 'GET':
            return JsonResponse({'results': [resource.serialize(record) for record in resource.queryset()]})
        if request.method == 'POST':
            return save_record(request, resource)
        return error('A record identifier is required.', 405)
    instance = resource.queryset().filter(pk=record_id).first()
    if instance is None:
        return error('This record no longer exists.', 404)
    if request.method == 'GET':
        return JsonResponse({'record': resource.serialize(instance)})
    if request.method == 'PATCH':
        return save_record(request, resource, instance)
    if request.method == 'DELETE':
        return delete_record(instance)
    return error('This method is not supported for an existing record.', 405)
