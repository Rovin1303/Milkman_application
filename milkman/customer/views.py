from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Customer
from .serializers import CustomerSerializer
from staff.auth import create_token


# ==============================
# CUSTOMER CRUD VIEW
# ==============================

class CustomerViewSet(APIView):

    # 🔥 No authentication
    authentication_classes = []
    permission_classes = []

    # ✅ GET - List all customers or fetch single customer
    def get(self, request, pk=None):
        if pk is not None:
            customer = get_object_or_404(Customer, pk=pk)
            serializer = CustomerSerializer(customer)
            return Response(serializer.data)

        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    # ✅ POST - Register customer
    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    # ✅ PUT - Update customer
    def put(self, request, pk):
        customer = get_object_or_404(Customer, pk=pk)
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # ✅ DELETE
    def delete(self, request, pk):
        customer = get_object_or_404(Customer, pk=pk)
        customer.delete()
        return Response({"message": "Deleted"}, status=204)


# ==============================
# CUSTOMER LOGIN VIEW
# ==============================

class CustomerLoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()

        if not email or not password:
            return Response({"error": "Email and password required"}, status=400)

        customer = Customer.objects.filter(email__iexact=email).first()

        if not customer:
            return Response({"error": "Invalid email or password"}, status=401)

        if password != customer.password:
            return Response({"error": "Invalid email or password"}, status=401)

        token = create_token(customer)

        return Response({
            "token": token,
            "id": customer.id,
            "name": customer.name,
            "email": customer.email
        })