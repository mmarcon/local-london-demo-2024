package com.example.rideshareapi.service;

import com.example.rideshareapi.model.MyEntity;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.model.Filters;
import org.springframework.stereotype.Service;

@Service
public class TripService {

//    private final MongoClient mongoClient = MongoDBUtil.getMongoClient();

    public FindIterable<MyEntity> getAllEntities(MongoClient mongoClient) {
        FindIterable<MyEntity> iterable = mongoClient.getDatabase("HealthInspectionsDB")
                 .getCollection("restaurants", MyEntity.class)
                .find(Filters.eq("restaurant_name", 23));
//
//        FindIterable<MyEntity> iterable1 = mongoClient.getDatabase("HealthInspectionsDB")
//                .getCollection("r")


//        UpdateResult res = mongoClient.getDatabase("HealthInspectionsDB")
//                .getCollection("restaurant", MyEntity.class)
//                .updateOne(Filters.eq("restaurant_nam", 23), new Document("restaurant_name", 23));
////                .getCollection("restaurants", MyEntity.class)
////                .updateOne(Filters.eq("restaurant_name", 23), new Document("restaurant_name", 23));
        return iterable;
    }

}