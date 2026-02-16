import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main-page";
import ListaPresentes from "./component/ListaDePresentes";
import { RelatorioPresentes } from "./component/RelatorioPresentes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main/:id" element={<MainPage />} />
        <Route path="/gift-list/:id" element={<ListaPresentes />} />
        <Route path="gift-report" element={<RelatorioPresentes />} />
      </Routes>
    </Router>
  );
}

export default App;
