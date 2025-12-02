
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../common/Navbar";
import Input from "../common/Input";
import Button from "../common/button";
import Topbar from "../common/TopBar";
import { Menu } from "lucide-react";
import "../../styles/index.css";
import { Trash2, ChevronUp } from "lucide-react";
import "../../styles/index.css";



export default function CoursePage() {

  const { t } = useTranslation();
  //  Ajout obligatoire pour que Topbar fonctionne !
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 min-h-screen bg-white shadow-md">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6 bg-primary/5">



        {/* Top bar */}
        <Topbar activeStep={activeStep} setActiveStep={setActiveStep} />

        {/* ====================== */}
        {/*   CONTENT STEP 1      */}
        {/* ====================== */}
        {activeStep === 1 && (
          <div className="w-full bg-gradient-to-b from-white to-[#EAF4FB] rounded-2xl shadow-md p-6 lg:p-10">
            <h2 className="text-2xl font-semibold mb-6 text-grad-1">{t("course.basic_info")}</h2>

            {/* Title */}
            <div className="flex flex-col mb-6 bg-white">
              <label className="font-medium mb-2 textc">Title</label>
              <Input placeholder="Your course title" />
            </div>

            {/* Topic */}
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2">Course Topic</label>
              <textarea
                className="w-full min-h-[180px] border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2"
                placeholder="What is primarily taught in your course?"
              />
            </div>

            {/* Duration & Level */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col">
                <label className="font-medium mb-2">Durations</label>
                <select className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2">
                  <option>Day</option>
                  <option>Week</option>
                  <option>Month</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-2">Course Level</label>
                <select className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2">
                  <option>Select</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10 ">
              <Button className="px-6 py-2 rounded-xl border border-secondary  font-medium  bg-white shadow-sm transition">Cancel</Button>
              <Button className="px-6 py-2 rounded-xl bg-primary text-white font-medium " onClick={() => setActiveStep(2)}>
                Save & Next
              </Button>


            </div>
          </div>
        )}

        {/* ====================== */}
        {/*   CONTENT STEP 2      */}
        {/* ====================== */}
        {activeStep === 2 && (
          <div className="w-full bg-white rounded-2xl shadow-md p-6">


            {activeStep === 2 && (
              <div className="w-full p-0">
                {/* ========= TON CURRICULUM EXACT (intégré) ========= */}
                <div className="mt-6 bg-gradient-to-b from-white to-[#EAF4FB] rounded-2xl shadow-2xl p-6 lg:p-10 relative">

                  {/* floating Add section button */}
                  <div className="absolute right-8 top-8">
                    <Button className="shadow-lg px-6 py-2 rounded-xl bg-primary text-white font-medium">
                      Add section
                    </Button>
                  </div>

                  <h1 className="text-3xl font-semibold text-slate-800 mb-6">
                    Course <span className="text-sky-600">Curriculum</span>
                  </h1>

                  {/* section wrapper */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-transparent">
                    <div className="rounded-lg bg-white p-3">

                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-semibold">
                          1
                        </div>

                        <Input
                          placeholder="Section title"
                          readOnly
                          className="!bg-transparent !border-0 px-2"
                        />

                        <div className="ml-auto flex items-center gap-2 text-gray-400">
                          <button className="text-gray-400 hover:text-gray-600">
                            <ChevronUp size={18} strokeWidth={1.8} />
                          </button>

                          <button className="text-gray-400 hover:text-red-500">
                            <Trash2 size={18} strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* LESSON 1 */}
                        <div className="flex items-center gap-4 bg-gray-50 rounded-md p-3">
                          <div className="text-sm text-textc w-6">1.</div>

                          <div className="flex-1">
                            <Input value="Lesson" readOnly className="!bg-transparent !border-0" />
                          </div>

                          <select className="text-sm px-3 py-2 rounded-lg border bg-white">
                            <option>Type of content</option>
                          </select>

                          <button className="text-gray-400 hover:text-red-500">
                            <Trash2 size={20} strokeWidth={1.8} />
                          </button>
                        </div>

                        {/* LESSON 2 */}
                        <div className="flex items-center gap-4 bg-gray-50 rounded-md p-3">
                          <div className="text-sm text-gray-500 w-6">2.</div>

                          <div className="flex-1">
                            <Input value="Lesson" readOnly className="!bg-transparent !border-0" />
                          </div>

                          <select className="text-sm px-3 py-2 rounded-lg border bg-white">
                            <option>Type of content</option>
                          </select>

                          <button className="text-gray-400 hover:text-red-500">
                            <Trash2 size={20} strokeWidth={1.8} />
                          </button>
                        </div>

                        <div className="flex justify-center mt-4">
                          <button className="w-1/2 rounded-xl border border-sky-200 py-2 text-sky-600 font-medium">
                            + Add Lesson
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* bottom buttons */}
                  <div className="mt-12 flex items-center justify-between">
                    <Button className="px-8 py-2 rounded-xl border border-secondary  font-medium  bg-white shadow-sm transition" onClick={() => setActiveStep(1)}>
                      Back
                    </Button>

                    <Button className="px-6 py-2 rounded-xl bg-primary text-white font-medium" onClick={() => setActiveStep(3)}>
                      Save & Next
                    </Button>
                  </div>
                </div>
              </div>
            )}



            <Button text="Next" onClick={() => setActiveStep(3)} />
          </div>
        )}

        {/* ====================== */}
        {/*   CONTENT STEP 3      */}
        {/* ====================== */}
        {activeStep === 3 && (
          <div className="w-full bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold">Publish Course</h2>
            <p>→ Ici tu mets ta page finale.</p>
          </div>
        )}
      </div>
    </div>
  );
}
