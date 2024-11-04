package com.example.rideshareapi.util;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

public class MongoDBUtil {
    private static MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString("mongodb://localhost:27018?directConnection=true"))
            .build();
    private static MongoClient mongoClient = MongoClients.create(settings);
    public static MongoClient getMongoClient() {
        return mongoClient;
    }
}
