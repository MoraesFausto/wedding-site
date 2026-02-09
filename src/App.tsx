import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/main-page";
import ListaPresentes from "./component/ListaDePresentes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main/:id" element={<MainPage />} />
        <Route path="/gift-list/:id" element={<ListaPresentes />} />
      </Routes>
    </Router>
  );
}

export default App;
