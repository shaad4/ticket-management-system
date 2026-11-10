from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    assigned_to_username = serializers.CharField(
        source="assigned_to.username", read_only=True, default=None
    )

    class Meta:
        model = Ticket
        fields = "__all__"

        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        if request is None:
            raise serializers.ValidationError("Request context is required.")

        if not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")

        if not request.user.is_staff:
            restricted_fields = {"status", "assigned_to"}

            for field in restricted_fields:
                if field in self.initial_data:
                    raise serializers.ValidationError(
                        {field: "Only administrators can modify this field."}
                    )

        return attrs
