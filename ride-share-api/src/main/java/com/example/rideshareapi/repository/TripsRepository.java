package com.example.rideshareapi.repository;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class TripsRepository {
    private final MongoCollection<Document> trips;

    public TripsRepository(MongoClient client) {
        this.trips = client.getDatabase("production").getCollection("trips");
    }

    public List<Document> findAllPendingDisputesByTypeFare() {
        return trips.find(Filters.and(
            // filters
                Filters.eq("dispute.status", "pending"),
                Filters.eq("dispute.type", "fare")
        )).into(new ArrayList<>());

    }


    public List<Document> findCompletedTripsByDriver(String driverId) {
        return trips.find(Filters.and(
                Filters.eq("trip_status", "completed"),
                Filters.eq("driver_id", driverId)
        )).into(new ArrayList<>());
    }


    public List<Document> findTripsWithinTimeRange(String startTime, String endTime) {
        return trips.find(Filters.and(
                Filters.gte("start_time", startTime),
                Filters.lte("end_time", endTime)
        )).into(new ArrayList<>());
    }

    // 4. Find trips by payment method
    public List<Document> findTripsByPaymentMethod(String paymentMethod) {
        return trips.find(Filters.eq("payment_method", paymentMethod)).into(new ArrayList<>());
    }

    // 5. Get all trips with low driver rating (below a threshold)
    public List<Document> findTripsWithLowDriverRating(int ratingThreshold) {
        return trips.find(Filters.lt("ratings.driver_rating", ratingThreshold)).into(new ArrayList<>());
    }

    // 6. Calculate total distance traveled for a passenger across all trips
    public double calculateTotalDistanceForPassenger(String passengerId) {
        return trips.find(Filters.eq("passenger_id", passengerId))
                .into(new ArrayList<>())
                .stream()
                .mapToDouble(trip -> trip.getDouble("actual_distance"))
                .sum();
    }

    // 7. Find trips with disputes assigned to a specific user
    public List<Document> findDisputesByAssignee(String assigneeId) {
        return trips.find(Filters.eq("dispute.assignee", assigneeId)).into(new ArrayList<>());
    }
}
