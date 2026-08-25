import { render, screen } from "@testing-library/react";
import { Marca } from "../../../src/web/src/components/marca";

describe("Marca", () => {
  it("apresenta o nome do produto", () => {
    render(<Marca />);
    expect(screen.getByLabelText("LavaMais CRM")).toBeInTheDocument();
    expect(screen.getByText("CRM Comercial")).toBeVisible();
  });
});
