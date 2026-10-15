from django.http import JsonResponse


class AdminAccessMiddleware:
    """Django admin is session-based; apply the same role/password gate there."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/') and request.path not in ('/admin/login/', '/admin/logout/'):
            user = request.user
            if user.is_authenticated and (user.role != 'admin' or user.must_change_password):
                return JsonResponse({'message': 'Admin role and a changed password are required. Use the React portal to change your password.'}, status=403)
        return self.get_response(request)
