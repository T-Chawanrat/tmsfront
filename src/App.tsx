import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
// import ProtectedRoute from "./context/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
// import AppRemark from "./pages/AppRemark";
// import { AuthProvider } from "./context/AuthContext";
// import ProductWarehouse from "./pages/ProductWarehouse";
// import ProductOverdue from "./pages/ProductOverdue";
import { ColumnWidthsProvider } from "./context/ColumnWidths";

// import Videos from "./pages/UiElements/Videos";
// import Images from "./pages/UiElements/Images";
// import Alerts from "./pages/UiElements/Alerts";
// import Badges from "./pages/UiElements/Badges";
// import Avatars from "./pages/UiElements/Avatars";
// import Buttons from "./pages/UiElements/Buttons";
// import LineChart from "./pages/Charts/LineChart";
// import BarChart from "./pages/Charts/BarChart";
// import BasicTables from "./pages/Tables/BasicTables";
// import FormElements from "./pages/Forms/FormElements";
// import Home from "./pages/Dashboard/Home";

// import TrackingStatus from "./pages/TrackingStatus";
// import HomeCopy from "./pages/Dashboard/Home copy";
// import LayoutOver4w from "./pages/Over4W/LayoutOver4w";
// import ReceiveNoImage from "./pages/NoImage/ReceiveNoImage";
// import Intransit from "./pages/Intransit";
// import Sla from "./pages/Sla";
// import Bookings from "./pages/Bookings";
import Vgt from "./pages/Vgt";
// import Bills from "./pages/Bills";
// import LayoutONtruck from "./pages/Ontruck/LayoutOntruck";
// import LayoutNoImage from "./pages/NoImage/LayoutNoImage";
import BillImport from "./pages/BillImport";
import BillManual from "./pages/BillManual";
import BillScanWarehouse from "./pages/BillScanWarehouse";
import BillScanDc from "./pages/BillScanDc";
import BillImportADV from "./pages/BillImportADV";
import BillImportVGT from "./pages/BillImportVGT";
import PrintLabel from "./pages/PrintLabel";
import BillReport from "./pages/BillReport";

export default function App() {
  return (
    // <AuthProvider>
    <ColumnWidthsProvider>
      <Router basename="/tms">
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* <Route
                index
                path="/"
                element={
                  <ProtectedRoute>
                    <HomeCopy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appremark"
                element={
                  <ProtectedRoute>
                    <AppRemark />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productwarehouse"
                element={
                  <ProtectedRoute>
                    <ProductWarehouse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productoverdue"
                element={
                  <ProtectedRoute>
                    <ProductOverdue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ontruck"
                element={
                  <ProtectedRoute>
                    <LayoutONtruck />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/over4w"
                element={
                  <ProtectedRoute>
                    <LayoutOver4w />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intransit"
                element={
                  <ProtectedRoute>
                    <Intransit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracking"
                element={
                  <ProtectedRoute>
                    <TrackingStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sla"
                element={
                  <ProtectedRoute>
                    <Sla />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/noimage"
                element={
                  <ProtectedRoute>
                    <LayoutNoImage />
                  </ProtectedRoute>
                }
              /> */}

            <Route path="/vgt" element={<Vgt />} />
            {/* <Route path="/bills" element={<Bills />} /> */}
            <Route path="/import" element={<BillImport />} />
            <Route path="/importvgt" element={<BillImportVGT />} />
            <Route path="/importadv" element={<BillImportADV />} />
            <Route path="/input" element={<BillManual />} />
            <Route path="/warehouse-scan" element={<BillScanWarehouse />} />
            <Route path="/dc-scan" element={<BillScanDc />} />
            <Route path="/labels" element={<PrintLabel />} />
            <Route path="/report" element={<BillReport />} />

            {/* Forms */}
            {/* <Route path="/form-elements" element={<FormElements />} /> */}

            {/* Tables */}
            {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

            {/* Ui Elements */}
            {/* <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} /> */}

            {/* Charts */}
            {/* <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} /> */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ColumnWidthsProvider>

    // </AuthProvider>
  );
}
