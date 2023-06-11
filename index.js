
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const { v4: uuidv4 } = require("uuid");
const { ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tdjlbxg.mongodb.net/?retryWrites=true&w=majority`;
const sessions = {};

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const surveyQuestionsCollection = client
      .db("servayApp")
      .collection("questions");
    const surveyAnswersCollection = client
      .db("servayApp")
      .collection("answers");

    app.get("/surveyQuestions", async (req, res) => {
      try {
        const query = {};
        const questions = await surveyQuestionsCollection.find(query).toArray();
        const formattedQuestions = questions.map((question) => ({
          questionId: uuidv4(),
          questions: question.questions,
        }));
        res.send(formattedQuestions);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while fetching questions",
          });
      }
    });

app.post("/surveyAnswers", async (req, res) => {
  try {
    const answers = req.body.answers;
    const surveyCompleted = req.body.surveyCompleted;

    // Generate a unique session ID
    const sessionId = uuidv4();

    // Format the answers
    const formattedAnswers = answers.map((answer) => ({
      questionId: answer.questionId,
      value: answer.value,
    }));

    // Create an object with the sessionId, answers, and survey completion status
    const surveyData = {
      sessionId: sessionId,
      answers: formattedAnswers,
      surveyCompleted: surveyCompleted,
    };

    // Insert the survey data into the surveyAnswers collection
    const result = await surveyAnswersCollection.insertOne(surveyData);

    if (result.acknowledged) {
      const insertedDocument = await surveyAnswersCollection.findOne({
        _id: result.insertedId,
      });

      if (insertedDocument) {
        console.log("insertedDocument:", insertedDocument);
        res.json({ success: true, answers: insertedDocument });
      } else {
        throw new Error("Unable to retrieve inserted document");
      }
    } else {
      throw new Error("Failed to insert document");
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while adding the answers",
      });
  }
});

    
    app.post("/addQuestion", async (req, res) => {
      try {
        const question = {
          _id: new ObjectId(),
          questionId: uuidv4(),
          questions: req.body.question,
        };
        console.log(question);
        const result = await surveyQuestionsCollection.insertOne(question);
        const insertedQuestion = {
          _id: question._id.toString(),
          questionId: question.questionId,
          question: question.questions,
        };
        res.send(insertedQuestion);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while adding the question",
          });
      }
    });
    app.get("/getQuestions", async (req, res) => {
      try {
        const query = {};
        const questions = await surveyQuestionsCollection.find(query).toArray();
        const formattedQuestions = questions.map((question) => ({
          _id: question._id.toString(), // Convert ObjectId to string
          questionId: uuidv4(),
          question: question.questions,
        }));
        res.send(formattedQuestions);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({
            success: false,
            message: "An error occurred while fetching questions",
          });
      }
    });
    app.post("/startSession", async (req, res) => {
      try {
        const sessionId = uuidv4();
        sessions[sessionId] = {};
        res.status(200).json({ sessionId });
      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "An error occurred while starting the session" });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("servay app is running");
});

app.listen(port, () => {
  console.log(`servay app is running on port ${port}`);
});
