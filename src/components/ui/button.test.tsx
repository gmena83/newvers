import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
    it("renders correctly with default props", () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole("button", { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("bg-primary"); // default variant
        expect(button).toHaveClass("h-10"); // default size
    });

    it("renders different variants", () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>);
        let button = screen.getByRole("button", { name: /destructive/i });
        expect(button).toHaveClass("bg-destructive");

        rerender(<Button variant="outline">Outline</Button>);
        button = screen.getByRole("button", { name: /outline/i });
        expect(button).toHaveClass("border border-input");

        rerender(<Button variant="secondary">Secondary</Button>);
        button = screen.getByRole("button", { name: /secondary/i });
        expect(button).toHaveClass("bg-secondary");

        rerender(<Button variant="ghost">Ghost</Button>);
        button = screen.getByRole("button", { name: /ghost/i });
        expect(button).toHaveClass("hover:bg-accent");

        rerender(<Button variant="link">Link</Button>);
        button = screen.getByRole("button", { name: /link/i });
        expect(button).toHaveClass("text-primary underline-offset-4");
    });

    it("renders different sizes", () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        let button = screen.getByRole("button", { name: /small/i });
        expect(button).toHaveClass("h-9");

        rerender(<Button size="lg">Large</Button>);
        button = screen.getByRole("button", { name: /large/i });
        expect(button).toHaveClass("h-11");

        rerender(<Button size="icon">Icon</Button>);
        button = screen.getByRole("button", { name: /icon/i });
        expect(button).toHaveClass("h-10 w-10");
    });

    it("renders as a different component when asChild is true", () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );
        const link = screen.getByRole("link", { name: /link button/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveClass("bg-primary");
    });

    it("forwards ref correctly", () => {
        const ref = React.createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Ref Button</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("calls onClick handler when clicked", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole("button", { name: /click me/i });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is passed", () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole("button", { name: /disabled/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-50");
    });

    it("applies custom className", () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole("button", { name: /custom/i });
        expect(button).toHaveClass("custom-class");
    });
});
