# Project Setup Guide

This guide provides step-by-step instructions for setting up and running the React frontend and Node.js backend projects, as well as loading database JSON files into MongoDB Compass on both Windows and macOS.

---

## Prerequisites

Ensure the following are installed on your system:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager) or **yarn**
- **MongoDB Compass**
- A code editor like Visual Studio Code

---

## Frontend Setup (React)

1. **Navigate to the frontend directory:**

   ```
   cd frontend
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

   Or, if using Yarn:

   ```
   yarn install
   ```

3. **Run the development server:**

   ```
   npm start
   ```

   Or, if using Yarn:

   ```
   yarn start
   ```

4. **Access the application:**
   Open your browser and navigate to `<span>http://localhost:3000</span>`.

---

## Backend Setup (Node.js)

1. **Navigate to the backend directory:**

   ```
   cd backend
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

   Or, if using Yarn:

   ```
   yarn install
   ```

3. **Start the backend server:**

   ```
   npm start
   ```

   Or, if using Yarn:

   ```
   yarn start
   ```

4. **Verify the backend:**
   By default, the backend runs on `<span>http://localhost:5000</span>`. You can use tools like Postman or a browser to test the API endpoints.

---

## Loading Database JSON Files into MongoDB Compass

### Files Location

The database JSON files are located in the `<span>database_json</span>` folder.

### Steps to Load Files (Windows/macOS):

1. **Open MongoDB Compass.**
2. **Connect to the MongoDB server:**

   - Use the default connection string: `<span>mongodb://localhost:27017</span>`
   - Click "Connect."

3. **Create a new database (if not already created):**

   - Click on the "Create Database" button.
   - Enter the database name (e.g., `<span>my_database</span>`) and an initial collection name (e.g., `<span>temp</span>`).
   - Click "Create Database."

4. **Load a single JSON file:**

   - Select the target database and collection in Compass.
   - Click "Add Data" > "Import File."
   - Browse to the `<span>database_json</span>` folder and select the desired JSON file.
   - Choose `<span>JSON</span>` as the file type and click "Import."

5. **Load all JSON files:**

   - Repeat the above process for each file.

   Or, if you want to automate this process:

   - **Windows:**
     Use a script in the Command Prompt or PowerShell:
     ```
     for %i in (database_json\*.json) do mongoimport --db my_database --collection %~ni --file %i --jsonArray
     ```
   - **macOS:**
     Use a script in the terminal:
     ```
     for file in database_json/*.json; do mongoimport --db my_database --collection $(basename "$file" .json) --file "$file" --jsonArray; done
     ```

6. **Verify the import:**

   - Refresh the database view in Compass.
   - Ensure the data has been correctly imported into the appropriate collections.

---

### Notes

- Replace `<span>my_database</span>` with the actual database name you wish to use.
- Ensure MongoDB is running locally before starting Compass or importing data.
- For large JSON files, importing might take some time.

---

You're now ready to run the full-stack application and work with the imported data!
