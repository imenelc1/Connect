import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/common/Navbar";
import Input from "../components/common/Input";
import Topbar from "../components/common/TopBar";
import { Trash2, ChevronUp } from "lucide-react";
import ThemeContext from "../context/ThemeContext";
import ThemeButton from "../components/common/ThemeButton";
import Select from "../components/common/Select";

export default function CoursePage() {
  const { t } = useTranslation();
  //  Ajout obligatoire pour que Topbar fonctionne !
  const [activeStep, setActiveStep] = useState(1);

  const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full min-h-screen flex bg-primary/5">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 min-h-screen">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 gap-6 ">
        <ThemeButton onClick={toggleDarkMode} />

        {/* Top bar */}
        <Topbar activeStep={activeStep} setActiveStep={setActiveStep} />

        {/* ====================== */}
        {/*   CONTENT STEP 1      */}
        {/* ====================== */}
        {activeStep === 1 && (
          <div className="w-full bg-grad-2 rounded-2xl shadow-md p-6 lg:p-10">
            <h2 className="text-2xl font-semibold mb-6 text-grad-1">
              {t("course.basic_info")}
            </h2>

            {/* Title */}
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2 textc">Title</label>
              <Input placeholder="Your course title" className="text-black" />
            </div>

            {/* Topic */}
            <div className="flex flex-col mb-6">
              <label className="font-medium mb-2">Course Topic</label>
              <textarea
                className="w-full min-h-[180px] border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2"
                text-black
                placeholder="What is primarily taught in your course?"
              />
            </div>

            {/* Duration & Level */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col">
                <label className="font-medium mb-2">Durations</label>
                <Select
                  className="w-full rounded-full border border-grayc
                                           px-5 py-3 bg-background shadow-sm focus:outline-none
                                           focus:ring-2 focus:ring-primary"
                  options={[
                    { value: "", label: t("select.placeholder") },
                    { value: "day", label: t("select.day") },
                    { value: "week", label: t("select.week") },
                    { value: "month", label: t("select.month") },
                  ]}
                />

                
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-2">Course Level</label>
                <Select
                  className="w-full rounded-full border border-grayc
                                           px-5 py-3 bg-background shadow-sm focus:outline-none
                                           focus:ring-2 focus:ring-primary"
                  options={[
                    { value: "", label: t("select.placeholder") },
                    { value: "Beginner", label: t("select.Beginner") },
                    { value: "Intermediate", label: t("select.Intermediate") },
                    { value: "Advanced", label: t("select.Advanced") },
                  ]}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10 ">
              <button className="px-6 py-2 rounded-xl border border-secondary  font-medium  bg-white shadow-sm transition text-black/50">
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-xl bg-grad-1 text-white font-medium "
                onClick={() => setActiveStep(2)}
              >
                Save & Next
              </button>
            </div>
          </div>
        )}

        {/* ====================== */}
        {/*   CONTENT STEP 2      */}
        {/* ====================== */}
        {activeStep === 2 && (
          <div className="w-full p-6">
            {activeStep === 2 && (
              <div className="w-full p-0">
                {/* ========= TON CURRICULUM EXACT (intégré) ========= */}
                <div className="mt-6 bg-grad-2 rounded-2xl shadow-2xl p-6 lg:p-10 relative">
                  {/* floating Add section button */}
                  <div className="absolute right-8 top-8">
                    <button className="shadow-lg px-6 py-2 rounded-xl bg-grad-1 text-white font-medium">
                      Add section
                    </button>
                  </div>

                  <h1 className="text-3xl font-semibold text- mb-6">
                    Course <span className="text-muted">Curriculum</span>
                  </h1>

                  {/* section wrapper */}
                  <div className="bg-background rounded-xl p-4 shadow-sm border border-transparent">
                    <div className="rounded-lg  p-3">
                      <div className="flex items-center gap-4 mb-3 bg-card">
                        <div className="w-8 h-8 rounded-full text-textc flex justify-center bg-card">
                          1
                        </div>

                        <Input
                          placeholder="Section title"
                          readOnly
                          className="!bg-transparent !border-0 px-2 text-textc"
                        />

                        <div className="ml-auto flex items-center gap-2 text-gray-400 text-muted">
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
                        <div className="flex items-center gap-4 bg-card rounded-md p-3">
                          <div className="text-sm text-textc w-6">1.</div>

                          <div className="flex-1">
                            <Input
                              value="Lesson"
                              readOnly
                              className="!bg-transparent !border-0 text-textc"
                            />
                          </div>

                          <Select className="text-sm px-3 py-2 rounded-lg border bg-white text-textc" options={[
                            { value: "type", label: "type" },
                          ]}
                            
                          />

                          <button className="text-gray-400 hover:text-red-500">
                            <Trash2 size={20} strokeWidth={1.8} />
                          </button>
                        </div>

                        {/* LESSON 2 */}
                        <div className="flex items-center gap-4 rounded-md p-3 bg-card">
                          <div className="text-sm text-textc w-6 ">2.</div>

                          <div className="flex-1">
                            <Input
                              value="Lesson"
                              readOnly
                              className="!bg-transparent !border-0 text-textc"
                            />
                          </div>

                          <Select className="text-sm px-3 py-2 rounded-lg border"
                            options={[
                              { value: "type", label: "type" },
                            ]}
                          />

                          <button className="text-gray-400 hover:text-red-500">
                            <Trash2 size={20} strokeWidth={1.8} />
                          </button>
                        </div>

                        <div className="flex justify-center mt-4">
                          <button className="w-1/2 rounded-xl border py-2 bg-primary text-white font-medium">
                            + Add Lesson
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* bottom buttons */}
                  <div className="mt-12 flex items-center justify-between">
                    <button
                      className="px-8 py-2 rounded-xl font-medium text-black/50 shadow-sm transition bg-white"
                      onClick={() => setActiveStep(1)}
                    >
                      Back
                    </button>

                    <button
                      className="px-6 py-2 rounded-xl bg-primary text-white font-medium bg-grad-1"
                      onClick={() => setActiveStep(3)}
                    >
                      Save & Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button text="Next" onClick={() => setActiveStep(3)}></button>
          </div>
        )}

        {/* ====================== */}
        {/*   CONTENT STEP 3      */}
        {/* ====================== */}
        {activeStep === 3 && (
          <div className="w-full bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold">Publish Course</h2>
            <p>→ Ici page finale.</p>
          </div>
        )}
      </div>
    </div>
  );
}
