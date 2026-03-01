from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password

from .models import Staff
from .serializers import StaffSerializer
from .auth import create_token, StaffTokenAuthentication

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Staff
from .serializers import StaffSerializer
from .auth import create_token, StaffTokenAuthentication


class StaffViewSet(APIView):

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    authentication_classes = [StaffTokenAuthentication]

    def get(self, request, format=None):
        staff = Staff.objects.all()
        serializer = StaffSerializer(staff, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = StaffSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, format=None):
        staff = get_object_or_404(Staff, pk=pk)
        serializer = StaffSerializer(staff, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        staff = get_object_or_404(Staff, pk=pk)
        staff.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class LoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Email and password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            staff = Staff.objects.get(email=email)
        except Staff.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not staff.is_active:
            return Response(
                {"detail": "Account is inactive"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not check_password(password, staff.password):
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = create_token(staff)

        return Response({
            "token": token,
            "staff_id": staff.pk,
            "email": staff.email
        })