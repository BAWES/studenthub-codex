// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

afterEach(() => {
  cleanup();
});

describe("TableRow — keyboard accessibility", () => {
  it("renders as a basic table row without onClick", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("row");
    expect(row).toBeInTheDocument();
  });

  it("adds tabIndex={0} when onClick is provided", () => {
    render(
      <Table>
        <TableBody>
          <TableRow onClick={() => {}}>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("button");
    expect(row).toHaveAttribute("tabindex", "0");
  });

  it("sets role='button' when onClick is provided", () => {
    render(
      <Table>
        <TableBody>
          <TableRow onClick={() => {}}>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("triggers onClick when Enter key is pressed", () => {
    const handleClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handleClick}>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("button");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("triggers onClick when Space key is pressed", () => {
    const handleClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handleClick}>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("button");
    fireEvent.keyDown(row, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onClick for other keys", () => {
    const handleClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handleClick}>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("button");
    fireEvent.keyDown(row, { key: "Tab" });
    fireEvent.keyDown(row, { key: "ArrowDown" });
    fireEvent.keyDown(row, { key: "a" });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not set role='button' when onClick is absent", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(0);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("allows custom onKeyDown alongside accessibility handler", () => {
    const handleClick = vi.fn();
    const handleCustomKey = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow onClick={handleClick} onKeyDown={handleCustomKey}>
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole("button");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleCustomKey).toHaveBeenCalledTimes(1);
  });
});
