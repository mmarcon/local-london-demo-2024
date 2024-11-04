import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import moment from "moment";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1/',
  apiKey: 'ollama'
});

const REVIEY_TYPES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  OK: 'ok'
}

async function generateReview(type) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: `You are ${type === REVIEY_TYPES.NEGATIVE ? 'an unhappy' : type === REVIEY_TYPES.POSITIVE ? 'a happy' : 'a'} customer of the London taxi company. When I ask you for a review of your taxi ride respond slightly overemphasizing that you are British but don't start with 'Blimey'. Always keep the response to 1 or 2 sentences max.` },
      { role: 'user', content: 'How was your taxi ride?' }
    ],
    model: 'llama3'
  });
  return chatCompletion.choices[0].message.content;
}

function generateNearbyLocation(center, radiusInMeters) {
  const radiusInDegrees = radiusInMeters / 111000; // roughly converts meters to degrees

  const w = radiusInDegrees * Math.sqrt(Math.random());
  const t = 2 * Math.PI * Math.random();
  const dx = w * Math.cos(t);
  const dy = w * Math.sin(t);

  const newLongitude = center.longitude + dx;
  const newLatitude = center.latitude + dy;

  return {
    longitude: newLongitude,
    latitude: newLatitude,
  };
}

function generateWithin5Miles(startPoint) {
  const maxDistanceDegrees = 5 / 69;
  return {
    longitude:
      startPoint.longitude +
      faker.number.float({
        min: -maxDistanceDegrees,
        max: maxDistanceDegrees,
        multipleOf: 0.02,
      }),
    latitude:
      startPoint.latitude +
      faker.number.float({
        min: -maxDistanceDegrees,
        max: maxDistanceDegrees,
        multipleOf: 0.02,
      }),
  };
}

function generateCheckpoints(startPoint, endPoint, minCheckpoints) {
  let checkpoints = [];
  const numberOfCheckpoints = faker.number.int({
    min: minCheckpoints,
    max: minCheckpoints + 100,
  });
  const latitudeDiff =
    (endPoint.latitude - startPoint.latitude) / numberOfCheckpoints;
  const longitudeDiff =
    (endPoint.longitude - startPoint.longitude) / numberOfCheckpoints;

  for (let i = 1; i <= numberOfCheckpoints; i++) {
    checkpoints.push({
      longitude:
        startPoint.longitude +
        longitudeDiff * i +
        faker.number.float({ min: -0.0005, max: 0.0005 }),
      latitude:
        startPoint.latitude +
        latitudeDiff * i +
        faker.number.float({ min: -0.0005, max: 0.0005 }),
    });
  }
  return checkpoints;
}

async function generateMockData(numEntries, fileName) {
  let data = [];
  const stream = fs.createWriteStream(fileName, { flags: "a" });

  const specificLocation = {
    longitude: -0.1720977,
    latitude: 51.5193229,
  };

  stream.write("[\n");

  for (let i = 0; i < numEntries; i++) {
    const startTime = moment(faker.date.recent()).format("YYYY-MM-DDTHH:mm:ss");
    const endTime = moment(startTime)
      .add(faker.number.int({ min: 1, max: 120 }), "minutes")
      .format("YYYY-MM-DDTHH:mm:ss");
    const totalDurationMinutes = moment(endTime).diff(
      moment(startTime),
      "minutes"
    );

    const pickupLocation = generateNearbyLocation(specificLocation, 500);

    const dropoffLocation = generateWithin5Miles(pickupLocation);
    const driver_rating = faker.number.int({ min: 1, max: 5 });
    let reviewType = REVIEY_TYPES.OK;
    if (driver_rating < 3) {
      reviewType = REVIEY_TYPES.NEGATIVE;
    } else if (driver_rating > 3) {
      reviewType = REVIEY_TYPES.POSITIVE;
    }
    stream.write(
      JSON.stringify(
        {
          trip_id: v4(),
          driver_id: v4(),
          vehicle_id: v4(),
          passenger_id: v4(),
          total_fare: faker.number.float({
            min: 20.0,
            max: 200.0,
            multipleOf: 0.01,
          }),
          start_time: startTime,
          end_time: endTime,
          total_duration: totalDurationMinutes,
          dispute: {
            status: faker.helpers.arrayElement([
              "open",
              "pending",
              "resolved",
              "closed",
              "missingInfo",
              "rejected",
              "escalated",
              "inProgress",
            ]),
            created_at: moment(endTime)
              .add(faker.number.int({ min: 1, max: 120 }), "minutes")
              .format("YYYY-MM-DDTHH:mm:ss"),
            type: faker.helpers.arrayElement([
              "safety",
              "fare",
              "service",
              "route",
              "vehicle",
              "driver",
              "passenger",
              "other",
            ]),
          },
          // checkpoints: generateCheckpoints(pickupLocation, dropoffLocation, 1000),
          trip_status: "completed",
          pickup_location: {
            type: "Point",
            coordinates: [pickupLocation.longitude, pickupLocation.latitude],
          },
          dropoff_location: {
            type: "Point",
            coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
          },
          actual_distance: faker.number.float({
            min: 5.0,
            max: 20.0,
            multipleOf: 0.01,
          }),
          payment_method: faker.helpers.arrayElement([
            "cash",
            "credit_card",
            "paypal",
          ]),
          ratings: {
            passenger_rating: faker.number.int({ min: 1, max: 5 }),
            driver_rating
          },
          review: await generateReview(reviewType),
          created_at: startTime,
          updated_at: endTime,
        },
        null,
        2
      )
    );
    if (i < numEntries - 1) {
      stream.write(",\n");
    } else {
      stream.write("\n");
    }
  }
  stream.write("]");
  stream.end();
  return data;
}

// Generate mock data
generateMockData(parseInt(process.argv[2]), process.argv[3]);
