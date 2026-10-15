from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        data = response.data
        if isinstance(data, dict) and 'detail' in data:
            response.data = {'message': str(data['detail']), 'code': getattr(data['detail'], 'code', 'error')}
        else:
            response.data = {'message': 'Please correct the highlighted fields.', 'errors': data if isinstance(data, dict) else {'non_field_errors': data}}
    return response
