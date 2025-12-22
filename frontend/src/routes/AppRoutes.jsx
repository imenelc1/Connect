import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages publiques
import Acceuil from "../pages/Acceuil.jsx";
import Choice from "../pages/Choice";
import StudentSignup from "../pages/StudentSignUp";
import InstructorSignup from "../pages/InstructorSignUp";
import LoginInstructor from "../pages/LoginInstructor";
import LoginStudent from "../pages/LoginStudent";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Pages privées (désormais accessibles directement)
import Dashboardens from "../pages/dash-ens";
import Dashboardetu from "../pages/dash-etu";
import Setting from "../pages/Setting";
import AllCoursesPage from "../pages/AllCoursesPage";
import AllExercisesPage from "../pages/AllExercisesPage";
import AllQuizzesPage from "../pages/AllQuizzesPage";
import NewExercise from "../pages/NewExercice";
import ExercisePreview from "../pages/ExercisePreview";
import CoursInfo from "../pages/CoursInfo";
import CreateQuiz from "../pages/CreateQuiz";
import QuizPreview from "../pages/QuizPreview";
import CourseUpdate from "../pages/CourseUpdate";
import CommunityPage from "../pages/CommunityPage";
import Badges from "../pages/Badges";
import Courses from "../pages/Courses";
import MyStudents from "../pages/MyStudents";
import Spaces from "../pages/Spaces";
import ListeExercicesPage from "../pages/ListeExercicesPage";
import StudentExercice from "../pages/exerciceStudent";
import CodeExercisePage from '../pages/CodeExercisePage';
import TheoryExercisePage from '../pages/TheoryExercisePage';

import CourseDetails from "../pages/CourseDetails.jsx";
import SubmittedExercise from "../pages/SubmittedExercise.jsx";
import ProgressExercice from "../pages/ProgressionExo";
import ProgressStudent from "../pages/ProgressionStudent";
import QuizIntroPage from '../pages/QuizIntroPage';
import QuizTakePage from '../pages/QuizTakePage';
import QuizSummaryPage from '../pages/QuizSummaryPage';

import SubmittedExercises from "../pages/SubmittedExercises";
import QuizManagement from "../pages/QuizManagement";
import ExercisesManagement from "../pages/ExerciseManagement";
import CoursesManagement from "../pages/CourseManagement";
 import ValidationCourses from "../pages/ValidationCourses";
  import Dashboard from "../pages/Dashboard"
import AdminLogin from "../pages/AdminLogin.jsx";
import UpdateExercice from "../pages/UpdateExercice.jsx";
import StudentsMangement from "../pages/studentsManagement.jsx";
import BadgesManagement from "../pages/badgesManagement.jsx";
import ForumManagement from "../pages/forumManagement.jsx";
import SpacesManagement from "../pages/SpacesManagement.jsx";
import InstructorsManagement from "../pages/InstructorsManagement.jsx";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ------------------------- */}
        {/*       ROUTES PUBLIQUES    */}
        {/* ------------------------- */}
        <Route path="/" element={<Acceuil />} />
        <Route path="/choice" element={<Choice />} />

        {/* Signup */}
        <Route path="/signup/instructor" element={<InstructorSignup />} />
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* Login */}
        <Route path="/login/instructor" element={<LoginInstructor />} />
        <Route path="/login/student" element={<LoginStudent />} />

        {/* Password reset */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ------------------------- */}
        {/*       ROUTES SANS PROTECTION   */}
        {/* ------------------------- */}
        <Route path="/dashboard-ens" element={<Dashboardens />} />
        <Route path="/dashboard-etu" element={<Dashboardetu />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/all-courses" element={<AllCoursesPage />} />
        <Route path="/all-exercises" element={<AllExercisesPage />} />
        <Route path="/all-quizzes" element={<AllQuizzesPage />} />   
        <Route path="/new-exercise" element={<NewExercise />} />
        <Route path="/exercise-preview" element={<ExercisePreview />} />
        <Route path="/CoursInfo" element={<CoursInfo />} />
        <Route path="/create-quiz" element={<CreateQuiz />} /> {/*normalement ca vaaa*/}
        <Route path="/preview" element={<QuizPreview />} />
        <Route path="/courses/edit/:id" element={<CourseUpdate />} />
        <Route path="/exercices/edit/:id" element={<UpdateExercice />} />
        <Route path="/community" element={<CommunityPage />} /> {/* cavaaaaa */}
        <Route path="/badges" element={<Badges />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/ListeExercices" element={<ListeExercicesPage />} /> 
          <Route path="/ListeExercices/:coursId" element={<ListeExercicesPage />} /> {/*son fichier de tradu nexiste meme pas*/}
        <Route path="/student-exercice" element={<StudentExercice />} />
        <Route path="/progressExercice" element={<ProgressExercice />} />{/*le truc la de week*/}
        <Route path="/progressStudent" element={<ProgressStudent />} />
        <Route path="/quizIntro" element={<QuizIntroPage />} /> {/*rien a signaler pour le moment*/}
        <Route path="/quizTake" element={<QuizTakePage />} />{/*ok ok*/}
        <Route path="/quizSummary" element={<QuizSummaryPage />} /> {/*je narrive pas a retrouver le fichier */}
        <Route path="/codeExo" element={<CodeExercisePage />} /> {/*wtf */}
        <Route path="/theoryExo" element={<TheoryExercisePage />} />
        <Route path="/course-details" element={<CourseDetails />} />
        <Route path="/SubmittedExo" element={<SubmittedExercise />} />
        <Route path="/SubmittedExos" element={<SubmittedExercises />} />
         {/* Page des espaces */}
        <Route path="/spaceManagement" element={<SpacesManagement />} /> {/*edit subtitle wtf */}
         <Route path="/InstructorsManagement" element={<InstructorsManagement />} /> {/*cata */}


        {/* Routes avec paramètres */}
        <Route path="/CourseDetails/:id" element={<CourseDetails />} />
        <Route path="/Seecourses/:id" element={<Courses />} />
        <Route path="/MyStudents" element={<MyStudents />} />
        {/* quiz management */}
        <Route path="/QuizManagement" element={<QuizManagement />} />

        {/* exercise management */}
        <Route path="/ExerciseManagement" element={<ExercisesManagement />} />

        {/* admin */}
        <Route path="/validation-courses" element={<ValidationCourses />} />

        <Route path="/Dashboard-admin" element={<Dashboard/>} />

{/* course management */}
    <Route path="/CourseManagement" element={<CoursesManagement />} />
    <Route path="/admin/login" element={<AdminLogin />} />
     {/* students management */}
        <Route path="/StudentsManagement" element={<StudentsMangement />} />    {/* pas de modal */}
        {/* badges management */}
          <Route path="/BadgesManagement" element={<BadgesManagement />} />{/* meme chose */}
           {/* Forums management */}
            <Route path="/ForumManagement" element={<ForumManagement />} /> {/* meme chose */}

   
      </Routes>
    </BrowserRouter>
  );
}
