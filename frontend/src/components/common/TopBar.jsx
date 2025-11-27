// import React from "react";
// import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";

// export default function Topbar() {
//   return (
//     <div className="w-full bg-white rounded-2xl shadow-md p-4 flex items-center justify-center gap-10 md:gap-20">
//       {/* STEP 1 */}
//       <div className="flex flex-col items-center gap-1">
//         <div className="flex items-center gap-2">
//           <Monitor size={18} className="text-primary" />
//           <span className="text-primary font-semibold text-sm md:text-base">
//             Basic Information
//           </span>
//         </div>
//         <div className="w-20 h-[3px] bg-primary rounded-full"></div>
//       </div>

//       {/* STEP 2 */}
//       <div className="flex flex-col items-center gap-1 opacity-60">
//         <div className="flex items-center gap-2">
//           <BookOpenCheck size={18} />
//           <span className="font-medium text-sm md:text-base">Curriculum</span>
//         </div>
//         <div className="w-20 h-[3px] bg-transparent rounded-full"></div>
//       </div>

//       {/* STEP 3 */}
//       <div className="flex flex-col items-center gap-1 opacity-60">
//         <div className="flex items-center gap-2">
//           <CheckCircle size={18} />
//           <span className="font-medium text-sm md:text-base">Publish Course</span>
//         </div>
//         <div className="w-20 h-[3px] bg-transparent rounded-full"></div>
//       </div>
//     </div>
//   );
// }




import React from "react";
import { Monitor, BookOpenCheck, CheckCircle } from "lucide-react";

export default function Topbar({ activeStep, setActiveStep }) {
  return (
    <div className="w-full bg-card rounded-2xl shadow-md p-4 flex items-center justify-center gap-10 md:gap-20">

      {/* STEP 1 */}
      <div
        onClick={() => setActiveStep(1)}
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Monitor
            size={18}
            className={activeStep === 1 ? "text-muted" : "text-grayc"}
          />
          <span
            className={`font-semibold text-sm md:text-base ${activeStep === 1 ? "text-muted" : "text-grayc"
              }`}
          >
            Basic Information
          </span>
        </div>

        <div
          className={`w-20 h-[3px] rounded-full ${activeStep === 1 ? "bg-muted" : "bg-transparent"
            }`}
        ></div>
      </div>

      {/* STEP 2 */}
      <div
        onClick={() => setActiveStep(2)}
        className={`flex flex-col items-center gap-1 cursor-pointer ${activeStep === 1 ? "opacity-60" : ""
          }`}
      >
        <div className="flex items-center gap-2">
          <BookOpenCheck
            size={18}
            className={activeStep === 2 ? "text-muted" : "text-grayc"}
          />
          <span
            className={`font-semibold text-sm md:text-base ${activeStep === 2 ? "text-muted" : "text-grayc"
              }`}
          >
            Curriculum
          </span>
        </div>

        <div
          className={`w-20 h-[3px] rounded-full ${activeStep === 2 ? "bg-muted" : "bg-transparent"
            }`}
        ></div>
      </div>

      {/* STEP 3 */}
      <div
        onClick={() => setActiveStep(3)}
        className={`flex flex-col items-center gap-1 cursor-pointer ${activeStep <= 2 ? "opacity-60" : ""
          }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle
            size={18}
            className={activeStep === 3 ? "text-muted" : "text-grayc"}
          />
          <span
            className={`font-semibold text-sm md:text-base ${activeStep === 3 ? "text-muted" : "text-grayc"
              }`}
          >
            Publish Course
          </span>
        </div>

        <div
          className={`w-20 h-[3px] rounded-full ${activeStep === 3 ? "bg-muted" : "bg-transparent"
            }`}
        ></div>
      </div>
    </div>
  );
}
