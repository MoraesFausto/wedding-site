import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main-page";
import ListaPresentes from "./component/ListaDePresentes";
import { RelatorioPresentes } from "./component/RelatorioPresentes";
import ChaDeCozinha from "./pages/cha-de-cozinha";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main/:id" element={<MainPage />} />
        <Route path="/gift-list/:id" element={<ListaPresentes />} />
        <Route path="gift-report" element={<RelatorioPresentes />} />
        <Route path="/cha-de-cozinha/:id" element={<ChaDeCozinha />} />
      </Routes>
    </Router>
  );
}

export default App;
