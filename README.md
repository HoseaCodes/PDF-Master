Here is a README for your PDF Merge Next.js application:

---

# PDF Merge Next.js App

## Overview

This application is built with Next.js and uses MongoDB for data storage and AWS S3 for managing PDF files. It allows users to upload, view, read, and interact with PDFs using various features like AI voices, summaries, quizzes, and chat.

## Features

### Core Features

- **View Uploaded PDFs**: Users can view PDFs they have uploaded to the application.
- **Upload PDFs**: Users can upload PDF documents to the app, which are stored in an AWS S3 bucket.
- **Read PDFs Aloud**: The app can read PDFs aloud using AI voices.
- **Save Progress**: The application saves the reading progress on PDFs that are read aloud, allowing users to resume where they left off.
- **Highlight Read Sections**: Sections of the PDF that have been read aloud are highlighted for easy reference.
- **AI Voices**: Utilize AI-generated voices to read PDFs aloud.
- **Summarize PDFs**: Generate summaries of the PDFs for quick reference.
- **Create Quizzes from PDFs**: Users can create quizzes based on the content of the PDFs.
- **Chat with PDF**: Interact with the content of the PDF via a chat interface to extract specific information or ask questions.

### API Endpoints

- **/api/upload**: Endpoint for uploading PDFs.
- **Return PDF as Text**: Converts the uploaded PDF into text format for further processing.
- **Save to Database**: Stores metadata and progress information in the MongoDB database.
- **Upload to S3**: Handles the uploading of PDF files to the AWS S3 bucket.
- **Purge Unused Accounts**: Periodically deletes user accounts that have been inactive for over a year, removing the corresponding entries from MongoDB and deleting PDFs from AWS S3.

## Technologies Used

- **Next.js**: A React framework for building web applications with server-side rendering and static site generation.
- **MongoDB**: A NoSQL database for storing user data, including uploaded PDFs, user progress, and metadata.
- **AWS S3**: A cloud storage service used to store PDF files.

## Getting Started

### Prerequisites

- Node.js installed on your local machine.
- MongoDB instance for database operations.
- AWS account with an S3 bucket for storing PDF files.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pdf-merge-nextjs.git
   cd pdf-merge-nextjs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add your MongoDB connection string, AWS credentials, and any other necessary environment variables.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Uploading PDFs:** Use the upload interface to add PDFs to your library.
2. **Reading Aloud:** Select a PDF and choose the 'Read Aloud' option to hear it read by an AI voice.
3. **Highlight and Save Progress:** As the PDF is read aloud, sections will be highlighted, and your reading progress will be automatically saved.
4. **Summarize PDFs:** Click on the 'Summarize' button to get a quick overview of the PDF content.
5. **Create Quizzes:** Generate quizzes based on the content of the PDFs.
6. **Chat with PDFs:** Use the chat interface to ask questions or extract specific information from the PDF.

## API Documentation

### /api/upload

- **Method**: `POST`
- **Description**: Upload a PDF to the AWS S3 bucket and save the metadata to MongoDB.
- **Request Body**: `multipart/form-data` containing the PDF file.

### Return PDF as Text

- **Functionality**: Converts the uploaded PDF into text format for easier processing and interaction.

### Save to Database

- **Functionality**: Stores user information, uploaded PDFs, and progress data in MongoDB.

### Upload to S3

- **Functionality**: Handles uploading PDF files to AWS S3, ensuring secure and efficient storage.

### Purge Unused Accounts

- **Functionality**: Deletes inactive user accounts after one year, removing corresponding MongoDB entries and deleting associated PDFs from AWS S3.

## Contributing

Feel free to submit issues and pull requests if you'd like to contribute to the project.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact [your-email@example.com](mailto:your-email@example.com).

---

This README provides a comprehensive overview of the application, its features, setup instructions, and API documentation. Adjust the content as necessary to fit your specific project details.