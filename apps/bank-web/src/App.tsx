import { BrowserRouter, Routes, Route } from "react-router-dom";
import {PayPage} from "./pages/PayPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pay/:type/:token" element={<PayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

