// import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router";
// import { LogOut } from "lucide-react";

// // Assume these icons are imported from an icon library
// import {
//   // BoxCubeIcon,
//   // CalenderIcon,
//   ChevronDownIcon,
//   GridIcon,
//   HorizontaLDots,
//   // ListIcon,
//   // PageIcon,
//   // PieChartIcon,
//   // PlugInIcon,
//   // TableIcon,
//   // UserCircleIcon,
// } from "../icons";
// import { useSidebar } from "../context/SidebarContext";

// type NavItem = {
//   name: string;
//   icon: React.ReactNode;
//   path?: string;
//   subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
// };

// const navItems: NavItem[] = [
//   {
//     icon: <GridIcon />,
//     name: "Dashboard",
//     subItems: [
//       // { name: "Dashboard", path: "/", pro: false },
//       // { name: "Blank Page", path: "/blank", pro: false },
//       // { name: "Basic Tables", path: "/basic-tables", pro: false },
//       { name: "Remark", path: "/remark", pro: false },
//       { name: "หมายเหตุ (จากApp)", path: "/resend", pro: false },
//     ],
//   },
//   // {
//   //   icon: <CalenderIcon />,
//   //   name: "Calendar",
//   //   path: "/calendar",
//   // },
//   // {
//   //   icon: <UserCircleIcon />,
//   //   name: "User Profile",
//   //   path: "/profile",
//   // },
//   // {
//   //   name: "Forms",
//   //   icon: <ListIcon />,
//   //   subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
//   // },
//   // {
//   //   name: "Tables",
//   //   icon: <TableIcon />,
//   //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
//   // },
//   // {
//   //   name: "Pages",
//   //   icon: <PageIcon />,
//   //   subItems: [
//   //     { name: "Blank Page", path: "/blank", pro: false },
//   //     { name: "404 Error", path: "/error-404", pro: false },
//   //   ],
//   // },
// ];

// const othersItems: NavItem[] = [
//   // {
//   //   icon: <PieChartIcon />,
//   //   name: "Charts",
//   //   subItems: [
//   //     { name: "Line Chart", path: "/line-chart", pro: false },
//   //     { name: "Bar Chart", path: "/bar-chart", pro: false },
//   //   ],
//   // },
//   // {
//   //   icon: <BoxCubeIcon />,
//   //   name: "UI Elements",
//   //   subItems: [
//   //     { name: "Alerts", path: "/alerts", pro: false },
//   //     { name: "Avatar", path: "/avatars", pro: false },
//   //     { name: "Badge", path: "/badge", pro: false },
//   //     { name: "Buttons", path: "/buttons", pro: false },
//   //     { name: "Images", path: "/images", pro: false },
//   //     { name: "Videos", path: "/videos", pro: false },
//   //   ],
//   // },
//   // {
//   //   icon: <PlugInIcon />,
//   //   name: "Authentication",
//   //   subItems: [
//   //     { name: "Sign In", path: "/signin", pro: false },
//   //     { name: "Sign Up", path: "/signup", pro: false },
//   //   ],
//   // },
// ];

// const AppSidebar: React.FC = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [openSubmenu, setOpenSubmenu] = useState<{
//     type: "main" | "others";
//     index: number;
//   } | null>(null);
//   const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
//     {}
//   );
//   const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   // const isActive = (path: string) => location.pathname === path;
//   const isActive = useCallback(
//     (path: string) => location.pathname === path,
//     [location.pathname]
//   );

//   useEffect(() => {
//     let submenuMatched = false;
//     ["main", "others"].forEach((menuType) => {
//       const items = menuType === "main" ? navItems : othersItems;
//       items.forEach((nav, index) => {
//         if (nav.subItems) {
//           nav.subItems.forEach((subItem) => {
//             if (isActive(subItem.path)) {
//               setOpenSubmenu({
//                 type: menuType as "main" | "others",
//                 index,
//               });
//               submenuMatched = true;
//             }
//           });
//         }
//       });
//     });

//     if (!submenuMatched) {
//       setOpenSubmenu(null);
//     }
//   }, [location, isActive]);

//   useEffect(() => {
//     if (openSubmenu !== null) {
//       const key = `${openSubmenu.type}-${openSubmenu.index}`;
//       if (subMenuRefs.current[key]) {
//         setSubMenuHeight((prevHeights) => ({
//           ...prevHeights,
//           [key]: subMenuRefs.current[key]?.scrollHeight || 0,
//         }));
//       }
//     }
//   }, [openSubmenu]);

//   const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
//     setOpenSubmenu((prevOpenSubmenu) => {
//       if (
//         prevOpenSubmenu &&
//         prevOpenSubmenu.type === menuType &&
//         prevOpenSubmenu.index === index
//       ) {
//         return null;
//       }
//       return { type: menuType, index };
//     });
//   };

//   const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
//     <ul className="flex flex-col gap-4">
//       {items.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index, menuType)}
//               className={`menu-item group ${
//                 openSubmenu?.type === menuType && openSubmenu?.index === index
//                   ? "menu-item-active"
//                   : "menu-item-inactive"
//               } cursor-pointer ${
//                 !isExpanded && !isHovered
//                   ? "lg:justify-center"
//                   : "lg:justify-start"
//               }`}
//             >
//               <span
//                 className={`menu-item-icon-size  ${
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? "menu-item-icon-active"
//                     : "menu-item-icon-inactive"
//                 }`}
//               >
//                 {nav.icon}
//               </span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <span className="menu-item-text">{nav.name}</span>
//               )}
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <ChevronDownIcon
//                   className={`ml-auto w-5 h-5 transition-transform duration-200 ${
//                     openSubmenu?.type === menuType &&
//                     openSubmenu?.index === index
//                       ? "rotate-180 text-brand-500"
//                       : ""
//                   }`}
//                 />
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 to={nav.path}
//                 className={`menu-item group ${
//                   isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
//                 }`}
//               >
//                 <span
//                   className={`menu-item-icon-size ${
//                     isActive(nav.path)
//                       ? "menu-item-icon-active"
//                       : "menu-item-icon-inactive"
//                   }`}
//                 >
//                   {nav.icon}
//                 </span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                   <span className="menu-item-text">{nav.name}</span>
//                 )}
//               </Link>
//             )
//           )}
//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[`${menuType}-${index}`] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? `${subMenuHeight[`${menuType}-${index}`]}px`
//                     : "0px",
//               }}
//             >
//               <ul className="mt-2 space-y-1 ml-9">
//                 {nav.subItems.map((subItem) => (
//                   <li key={subItem.name}>
//                     <Link
//                       to={subItem.path}
//                       className={`menu-dropdown-item ${
//                         isActive(subItem.path)
//                           ? "menu-dropdown-item-active"
//                           : "menu-dropdown-item-inactive"
//                       }`}
//                     >
//                       {subItem.name}
//                       <span className="flex items-center gap-1 ml-auto">
//                         {subItem.new && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active"
//                                 : "menu-dropdown-badge-inactive"
//                             } menu-dropdown-badge`}
//                           >
//                             new
//                           </span>
//                         )}
//                         {subItem.pro && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active"
//                                 : "menu-dropdown-badge-inactive"
//                             } menu-dropdown-badge`}
//                           >
//                             pro
//                           </span>
//                         )}
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <aside
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
//         ${
//           isExpanded || isMobileOpen
//             ? "w-[290px]"
//             : isHovered
//             ? "w-[290px]"
//             : "w-[90px]"
//         }
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div
//         className={`py-8 flex ${
//           !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//         }`}
//       >
//         <Link to="/">
//           {isExpanded || isHovered || isMobileOpen ? (
//             <>
//               <img
//                 className="dark:hidden"
//                 src="/images/logo/logo.png"
//                 alt="Logo"
//                 width={150}
//                 height={40}
//               />
//               <img
//                 className="hidden dark:block"
//                 src="/images/logo/logo-dark.svg"
//                 alt="Logo"
//                 width={150}
//                 height={40}
//               />
//             </>
//           ) : (
//             <img
//               src="/images/logo/logo-icon.png"
//               alt="Logo"
//               width={32}
//               height={32}
//             />
//           )}
//         </Link>
//       </div>
//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Menu"
//                 ) : (
//                   <HorizontaLDots className="size-6" />
//                 )}
//               </h2>
//               {renderMenuItems(navItems, "main")}
//             </div>
//             <div className="">
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {/* {isExpanded || isHovered || isMobileOpen ? (
//                   "Others"
//                 ) : (
//                   <HorizontaLDots />
//                 )} */}
//               </h2>
//               {renderMenuItems(othersItems, "others")}
//             </div>
//           </div>
//         </nav>

//         <div className="mt-auto pb-8 flex flex-col items-center w-full">
//           <button
//             onClick={() => navigate("/signin", { replace: true })}
//             className="menu-item group menu-item-inactive cursor-pointer w-full text-left hover:bg-brand-50"
//           >
//             <span className="menu-item-icon-size menu-item-icon-inactive">
//               <LogOut className="text-brand-500" size={20} />
//             </span>
//             {(isExpanded || isHovered || isMobileOpen) && (
//               <span className="menu-item-text text-brand-500">Logout</span>
//             )}
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LogOut,
  // Warehouse,
  // Smartphone,
  // ClockAlert,
  // PackageCheck,
  // LayoutDashboard,
  // Truck,
  // TruckElectric,
  File,
} from "lucide-react";
import { ChevronDownIcon, GridIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Menu",
    subItems: [
      // {
      //   name: "แดชบอร์ด",
      //   path: "/",
      //   icon: <LayoutDashboard size={20} />,
      // },
      // {
      //   name: "หมายเหตุ (จาก App)",
      //   path: "/appremark",
      //   icon: <Smartphone size={20} />,
      // },
      // {
      //   name: "สินค้าในคลัง (ไม่มีหมายเหตุ)",
      //   path: "/productwarehouse",
      //   icon: <Warehouse size={20} />,
      // },
      // {
      //   name: "สินค้าในคลัง (มีหมายเหตุ)",
      //   path: "/productoverdue",
      //   icon: <ClockAlert size={20} />,
      // },
      // {
      //   name: "สินค้าบนรถขนย้าย (6W)",
      //   path: "/ontruck",
      //   icon: <Truck size={20} />,
      // },
      // {
      //   name: "สินค้าบนรถกระจาย (เกินเวลา)",
      //   path: "/over4w",
      //   icon: <TruckElectric size={20} />,
      // },
      // {
      //   name: "สินค้ากำลังนำส่ง",
      //   path: "/intransit",
      //   icon: <PackageCheck size={20} />,
      // },
      // {
      //   name: "ตาราง SLA",
      //   path: "/sla",
      //   icon: <File size={20} />,
      // },
      // {
      //   name: "ใบจองรถ",
      //   path: "/bookings",
      //   icon: <File size={20} />,
      // },
      // {
      //   name: "ไม่มีรูป",
      //   path: "/noimage",
      //   icon: <File size={20} />,
      // },
      // {
      //   name: "สถานะสินค้า",
      //   path: "/tracking",
      //   icon: <File size={20} />,
      // },
      {
        name: "import Excel",
        path: "/import",
        icon: <File size={20} />,
      },
      {
        name: "import VGT",
        path: "/importvgt",
        icon: <File size={20} />,
      },
      {
        name: "import ADV",
        path: "/importadv",
        icon: <File size={20} />,
      },
      {
        name: "คีย์บิล",
        path: "/input",
        icon: <File size={20} />,
      },
      {
        name: "Label",
        path: "/labels",
        icon: <File size={20} />,
      },
      {
        name: "Warehouse Scan",
        path: "/warehouse-scan",
        icon: <File size={20} />,
      },
      {
        name: "DC Scan",
        path: "/dc-scan",
        icon: <File size={20} />,
      },
      // {
      //   name: "ดูรูป bills",
      //   path: "/bills",
      //   icon: <File size={20} />,
      // },
      {
        name: "report",
        path: "/report",
        icon: <File size={20} />,
      },
    ],
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name} className="relative">
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>

              {/* ← แสดง subItems เมื่อ sidebar ย่อ (แสดงเฉพาะไอคอน) */}
              {nav.subItems &&
                !isExpanded &&
                !isMobileOpen &&
                openSubmenu?.type === menuType &&
                openSubmenu?.index === index && (
                  <div className="mt-2 space-y-2 overflow-hidden transition-all duration-300">
                    {nav.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={`flex justify-center items-center w-full h-10 rounded-md transition-colors ${
                          isActive(subItem.path)
                            ? "bg-brand-50 text-brand-500"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        title={subItem.name}
                      >
                        <span
                          className={`${
                            isActive(subItem.path)
                              ? "text-brand-500"
                              : "text-gray-600"
                          }`}
                        >
                          {subItem.icon}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

              {nav.subItems && (isExpanded || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  return (
    // <aside
    //   className={`font-thai fixed mt-[48px] flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
    //   ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
    //     ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    //     lg:translate-x-0`}
    // >
    //   <div
    //     className={`py-8 flex ${
    //       !isExpanded ? "lg:justify-center" : "justify-start"
    //     }`}
    //   >
    //     {/* <Link to="/"> */}
    //     {isExpanded || isMobileOpen ? (
    //       <>
    //         <img
    //           className="dark:hidden"
    //           src="/images/logo/logo.png"
    //           alt="Logo"
    //           width={130}
    //           height={40}
    //         />
    //         <img
    //           className="hidden dark:block"
    //           src="/images/logo/logo-dark.svg"
    //           alt="Logo"
    //           width={130}
    //           height={40}
    //         />
    //       </>
    //     ) : (
    //       <img
    //         src="/images/logo/logo-icon.png"
    //         alt="Logo"
    //         width={32}
    //         height={32}
    //       />
    //     )}
    //     {/* </Link> */}
    //   </div>
    //   <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
    //     <nav className="mb-6">
    //       <div className="flex flex-col gap-4">
    //         <div>
    //           {user && (
    //             <>
    //               <h2
    //                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
    //                   !isExpanded ? "lg:justify-center" : "justify-start"
    //                 }`}
    //               >
    //                 {isExpanded || isMobileOpen ? (
    //                   "Menu"
    //                 ) : (
    //                   <HorizontaLDots className="size-6" />
    //                 )}
    //               </h2>
    //               {renderMenuItems(navItems, "main")}
    //             </>
    //           )}
    //         </div>
    //       </div>
    //     </nav>

    //     {user && (
    //       <div className="mt-auto pb-8 flex flex-col items-center w-full">
    //         <button
    //           onClick={handleLogout}
    //           className="menu-item group menu-item-inactive cursor-pointer w-full text-left hover:bg-brand-50 py-1"
    //         >
    //           <span className="w-5 h-5 flex items-center justify-center">
    //             <LogOut className="text-brand-500" size={20} />
    //           </span>
    //           {(isExpanded || isMobileOpen) && (
    //             <span className="menu-item-text text-brand-500">Logout</span>
    //           )}
    //         </button>
    //       </div>
    //     )}
    //   </div>
    // </aside>


    <aside
  className={`
    font-thai fixed top-0 left-0 z-50
    mt-[48px] lg:mt-0
    h-screen
    bg-white text-slate-800
    border-r border-slate-200 shadow-sm
    dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800
    transition-all duration-300 ease-in-out
    ${isExpanded || isMobileOpen ? "w-[280px]" : "w-[90px]"}
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
>
  <div
    className={`py-8 flex ${
      !isExpanded ? "lg:justify-center" : "justify-start"
    }`}
  >
    {/* <Link to="/"> */}
    {isExpanded || isMobileOpen ? (
      <>
        <img
          className="dark:hidden"
          src="/images/logo/logo.png"
          alt="Logo"
          width={130}
          height={40}
        />
        <img
          className="hidden dark:block"
          src="/images/logo/logo-dark.svg"
          alt="Logo"
          width={130}
          height={40}
        />
      </>
    ) : (
      <img
        src="/images/logo/logo-icon.png"
        alt="Logo"
        width={32}
        height={32}
      />
    )}
    {/* </Link> */}
  </div>

  <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar duration-300 ease-linear">
    <nav className="mb-6">
      <div className="flex flex-col gap-4">
        <div>
          {user && (
            <>
              <h2
                className={`mb-4 uppercase flex leading-[20px] text-slate-400 ${
                  !isExpanded ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </>
          )}
        </div>
      </div>
    </nav>

    {user && (
      <div className="mt-auto pb-8 flex flex-col items-center w-full">
        <button
          onClick={handleLogout}
          className="
            menu-item menu-item-inactive group
            cursor-pointer w-full text-left
            py-1
            hover:bg-slate-50
          "
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <LogOut className="text-brand-500" size={20} />
          </span>
          {(isExpanded || isMobileOpen) && (
            <span className="menu-item-text text-brand-500">Logout</span>
          )}
        </button>
      </div>
    )}
  </div>
</aside>

  );
};

export default AppSidebar;
