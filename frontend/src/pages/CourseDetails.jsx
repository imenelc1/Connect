// // import React, { useState } from "react";
// // import Topbar from "../components/common/TopBar.jsx"; // ton Topbar amélioré
// // import Cards2 from "../components/common/Cards2.jsx";
// // import Button from "../components/common/Button.jsx";
// // import AddModal from "../components/common/AddModel.jsx";
// // import Navbar from "../components/common/Navbar.jsx";
// // import UserCircle from "../components/common/UserCircle";
// // import { useTranslation } from "react-i18next";

// // import { BookOpen, NotebookPen, FileCheck } from "lucide-react";

// // export default function CoursesPage() {

// //     const { t } = useTranslation("courseInfo");

// //     const [activeStep, setActiveStep] = useState(1);  // ⬅ identique à ton système
// //     const [openModal, setOpenModal] = useState(false);

// //     const courseSteps = [
// //         { label: "Courses", icon: BookOpen },
// //         { label: "Quizzes", icon: NotebookPen },
// //         { label: "Exercices", icon: FileCheck },
// //     ];

// //     // Data de cours (temporaire)
// //     const [courses, setCourses] = useState([
// //         {
// //             id: 1,
// //             icon: "JW",
// //             title: "Mobile Design Patterns",
// //             description: "Clean UI & UX strategies",
// //             date: "12/13/2025",
// //         },
// //         {
// //             id: 2,
// //             icon: "JW",
// //             title: "Advanced React Architecture",
// //             description: "Hooks, Zustand, Clean components",
// //             date: "12/22/2025",
// //         }
// //     ]);

// //     // Ajout d’un cours
// //     const handleAddCourse = (e) => {
// //         e.preventDefault();
// //         const name = e.target.name.value;
// //         const desc = e.target.description.value;

// //         setCourses([
// //             ...courses,
// //             {
// //                 id: Date.now(),
// //                 icon: "JW",
// //                 title: name,
// //                 description: desc,
// //                 date: new Date().toLocaleDateString()
// //             }
// //         ]);
// //         setOpenModal(false);
// //     };


// //     return (
// //         <div className="w-full min-h-screen flex bg-primary/5">
// //             {/* Sidebar */}
// //             <div className="hidden lg:block w-64 min-h-screen">
// //                 <Navbar />
// //             </div>
// //             {/* -------- PAGE CONTENT -------- */}
// //             <div className="flex-1 flex flex-col p-6 lg:p-12 gap-8">

// //                 {/* -------- TOPBAR identique à ta page -------- */}
// //                 <Topbar
// //                     steps={courseSteps}
// //                     activeStep={activeStep}
// //                     setActiveStep={setActiveStep}
// //                     className="mb-6 flex justify-between"
// //                 />

// //                 {/* -------- HEADER -------- */}
// //                 <div className="flex justify-between items-center">
// //                     <h1 className="text-2xl md:text-3xl font-semibold text-textc">
// //                         {t("course.course_list_title")}
// //                     </h1>

// //                     <Button
// //                         variant="createCourse"
// //                         className="!w-auto"
// //                         onClick={() => setOpenModal(true)}
// //                     >
// //                         + {t("course.add_course")}
// //                     </Button>
// //                 </div>

// //                 {/* -------- COURSE CARDS -------- */}
// //                 <div className="mt-10 grid gap-6
// //   md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
// //                     {courses.map((course) => (
// //                         <Cards2
// //                             key={course.id}
// //                             icon={course.icon}
// //                             title={course.title}
// //                             description={course.description}
// //                             status={`Created on ${course.date}`}
// //                             showArrow={true}
// //                             className="bg-surface shadow-sm rounded-xl border border-white/10 hover:shadow-md transition"
// //                         />
// //                     ))}
// //                 </div>


// //                 {/* -------- MODAL AJOUT -------- */}
// //                 <AddModal
// //                     open={openModal}
// //                     onClose={() => setOpenModal(false)}
// //                     title={t("course.add_course_title")}
// //                     subtitle={t("course.add_course_sub")}
// //                     submitLabel={t("course.create")}
// //                     fields={[
// //                         { label: t("course.title"), placeholder: t("course.course_title_placeholder"), name: "name" },
// //                         { label: t("course.description"), placeholder: t("course.course_description_placeholder"), name: "description" }
// //                     ]}
// //                     onSubmit={handleAddCourse}
// //                 />

// //             </div>
// //         </div>
// //     );
// // }

// import React, { useState } from "react";
// import Topbar from "../components/common/TopBar.jsx";
// import Cards2 from "../components/common/Cards2.jsx";
// import Button from "../components/common/Button.jsx";
// import AddModal from "../components/common/AddModel.jsx";
// import Navbar from "../components/common/Navbar.jsx";
// import UserCircle from "../components/common/UserCircle.jsx";
// import { BookOpen, NotebookPen, FileCheck } from "lucide-react";
// import { useTranslation } from "react-i18next";

// export default function CoursesPage() {
//   const { t } = useTranslation("courseInfo");

//   const [activeStep, setActiveStep] = useState(1);
//   const [openModal, setOpenModal] = useState(false);

//   const [courseTitle, setCourseTitle] = useState("");
//   const [courseDescription, setCourseDescription] = useState("");

//   const courseSteps = [
//     { label: "Courses", icon: BookOpen },
//     { label: "Quizzes", icon: NotebookPen },
//     { label: "Exercices", icon: FileCheck },
//   ];

//   const [courses, setCourses] = useState([
//     {
//       id: 1,
//       title: "Mobile Design Patterns",
//       description: "Clean UI & UX strategies",
//     initials: title.split(" ").map(w => w[0]).join("").slice(0,2),

//       date: "12/13/2025",
//       bg: "bg-grad-2"
//     },
//     {
//       id: 2,

//       title: "Introduction to design patterns",
//       description: "mobil design patterns",
//      initials: title.split(" ").map(w => w[0]).join("").slice(0,2),
//       date: "12/22/2025",
//       bg: "bg-grad-3"
//     }
//   ]);

//   const handleAddCourse = (e) => {
//     e.preventDefault();
//     setCourses([
//       ...courses,
//       {
//         id: Date.now(),
//         initials: courseTitle.split(" ").map(w => w[0]).join("").slice(0,2),
//         title: courseTitle,
//         description: courseDescription,
//         progress: 0,
//         date: new Date().toLocaleDateString(),
//         bg: "bg-grad-4"
//       }
//     ]);
//     setCourseTitle("");
//     setCourseDescription("");
//     setOpenModal(false);
//   };

//   return (
//     <div className="flex w-full">
//       <Navbar className="hidden lg:block" />

//       <main className="lg:ml-64 w-full min-h-screen px-6 py-6 bg-bg">
//         {/* Topbar */}
//         <Topbar
//           steps={courseSteps}
//           activeStep={activeStep}
//           setActiveStep={setActiveStep}
//           className="mb-6 flex justify-between"
//         />

//         {/* Header + bouton */}
//         <div className="flex justify-between items-center">
//           <h1 className="text-3xl font-semibold text-textc">{t("course_list_title")}</h1>
//           <Button onClick={() => setOpenModal(true)}>{t("add_course")}</Button>
//         </div>

//         {/* Course Cards */}
//         <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
//           {courses.map((course) => (
//             <Cards2
//               key={course.id}
//               icon={<UserCircle initials={course.initials} />}
//               roundedIcon={true}
//               title={course.title}
//               description={course.description}
//               progress={course.progress}
//               status={`Created on ${course.date}`}
//               className={`${course.bg} rounded-xl shadow-md border p-6`}
//             />
//           ))}
//         </div>

//         {/* Pagination (facultatif) */}
//         <div className="flex justify-center gap-4 mt-10 text-sm">
//           <span className="cursor-pointer">&lt;</span>
//           <span className="cursor-pointer hover:bg-secondary/80 px-2 rounded">1</span>
//           <span className="cursor-pointer hover:bg-secondary/80 px-2 rounded">2</span>
//           <span className="cursor-pointer hover:bg-secondary/80 px-2 rounded">3</span>
//           <span className="cursor-pointer">&gt;</span>
//         </div>

//         {/* Modal ajout cours */}
//         <AddModal
//           open={openModal}
//           onClose={() => setOpenModal(false)}
//           title={t("add_course_title")}
//           subtitle={t("add_course_sub")}
//           submitLabel={t("create")}
//           onSubmit={handleAddCourse}
//           fields={[
//             { label: t("title"), placeholder: t("course_title_placeholder"), value: courseTitle, onChange: e => setCourseTitle(e.target.value) },
//             { label: t("description"), placeholder: t("course_description_placeholder"), value: courseDescription, onChange: e => setCourseDescription(e.target.value) }
//           ]}
//         />
//       </main>
//     </div>
//   );
// }


import React, { useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Topbar from "../components/common/TopBar.jsx";
import Cards2 from "../components/common/Cards2.jsx";
import Button from "../components/common/Button.jsx";
import AddModal from "../components/common/AddModel.jsx";
import UserCircle from "../components/common/UserCircle.jsx";
import { BookOpen, NotebookPen, FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CourseDetails() {
    const { t } = useTranslation("courseInfo");

    const [activeStep, setActiveStep] = useState(1);
    const [openModal, setOpenModal] = useState(false);

    const [sectionTitle, setSectionTitle] = useState("");
    const [sectionDescription, setSectionDescription] = useState("");

    const courseSteps = [
        { label: "Course", icon: BookOpen },
        { label: "Quizzes", icon: NotebookPen },
        { label: "Exercises", icon: FileCheck },
    ];

    // Sections du cours (mock data)
    const [sections, setSections] = useState([
        {
            id: 1,
            title: "Introduction to design patterns",
            description: "mobile design patterns",
            bg: "bg-grad-2",
            date: "12/01/2025",
        },
        {
            id: 2,
            title: "Design Patterns Basics",
            description: "mobile design patterns",
            bg: "bg-grad-3",
            date: "12/05/2025",
        },
        {
            id: 3,
            title: "Advanced Patterns",
            description: "mobile design patterns",
            bg: "bg-grad-4",
            date: "12/10/2025",
        },
    ]);

    const handleAddSection = (e) => {
        e.preventDefault();
        setSections([
            ...sections,
            {
                id: Date.now(),
                title: sectionTitle,
                description: sectionDescription,
                progress: 0,
                bg: "bg-grad-5",
                date: new Date().toLocaleDateString(),
            },
        ]);
        setSectionTitle("");
        setSectionDescription("");
        setOpenModal(false);
    };

    return (
        <div className="flex w-full">
            {/* Sidebar */}
            <Navbar className="hidden lg:block" />

            {/* Contenu principal */}
            <main className="lg:ml-64 w-full min-h-screen px-6 py-6 bg-bg">

                {/* Topbar */}
                <Topbar
                    steps={courseSteps}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    className="mb-6 flex justify-between"
                />

                {/* Header + bouton */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto lg:ml-auto">
                    <h1 className="text-2xl font-regular text-textc">Courses</h1>
                    <Button onClick={() => setOpenModal(true)} className="!px-6 !py-2 w-full sm:w-auto">+ Add Course</Button>
                </div>

                {/* Sections */}
                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {sections.map((section) => (
                        <Cards2
                            key={section.id}
                            icon={<UserCircle initials={section.title.split(" ").map(w => w[0]).join("").slice(0, 2)} />}
                            roundedIcon={true}
                            title={section.title}
                            description={section.description}
                            progress={section.progress}
                            status={`Created on ${section.date}`}
                            className={`${section.bg} rounded-xl shadow-md border p-6`}
                        />
                    ))}
                </div>


                {/* Modal ajout section */}
                <AddModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    title="Add Courses To Spaces"
                    subtitle="Add a new course to mobile design patterns"
                    submitLabel="Create Cours"
                    onSubmit={handleAddSection}
                    fields={[
                        { label: "Course Name", placeholder: "e.g., Introduction To Mobile Design", value: sectionTitle, onChange: e => setSectionTitle(e.target.value) },

                        {
                            label: t("fieldDescription"),
                            element: (
                                <textarea
                                    placeholder="Describe What Students Will Larn"
                                    value={sectionDescription}
                                    onChange={(e) => setSpaceDesc(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2 
                                          focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={4}
                                />
                            ),
                        },
                    ]}
                />

            </main>
        </div>
    );
}
