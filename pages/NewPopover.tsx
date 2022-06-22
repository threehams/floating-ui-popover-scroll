import React, { Children, CSSProperties, useEffect } from "react";
import {
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  FloatingPortal,
  arrow,
  offset,
  shift,
  useFloating,
  FloatingFocusManager,
  autoUpdate,
  flip,
  Placement,
} from "@floating-ui/react-dom-interactions";
import { useState, useRef } from "react";
import classNames from "classnames";

export type NewPopoverColor = "tertiary" | "black" | "white";
export type NewPopoverProps = {
  placement?: Placement;
  trigger: React.ReactNode;
  children: React.ReactNode;
  initiallyOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  color?: NewPopoverColor;
};
export const NewPopover = ({
  placement: placementProp,
  trigger,
  children,
  initiallyOpen = false,
  onOpenChange,
}: NewPopoverProps) => {
  if (!isValidTrigger(trigger)) {
    throw new Error("Popover trigger must be exactly one non-fragment element");
  }
  const lastOpen = useRef(initiallyOpen);
  const [open, setOpen] = useState(initiallyOpen);
  useEffect(() => {
    if (open !== lastOpen.current) {
      onOpenChange?.(open);
      lastOpen.current = open;
    }
  }, [open, onOpenChange]);

  const arrowRef = useRef<HTMLDivElement>(null);
  const {
    x = 0,
    y = 0,
    reference,
    floating,
    strategy,
    context,
    middlewareData,
    placement,
  } = useFloating({
    placement: placementProp,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(15),
      flip({
        fallbackPlacements: [
          "bottom",
          "bottom-end",
          "bottom-start",
          "top",
          "top-start",
          "top-end",
          "left",
          "left-end",
          "left-start",
          "right",
          "right-end",
          "right-start",
        ],
      }),
      shift({ padding: 10 }),
      arrow({ element: arrowRef, padding: 10 }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useRole(context, { role: "dialog" }),
    useDismiss(context, { escapeKey: true }),
    useClick(context),
  ]);

  const clonedTrigger = React.cloneElement(
    trigger as React.ReactElement,
    getReferenceProps({ ref: reference })
  );

  return (
    <>
      {clonedTrigger}
      <FloatingPortal id="tooltip">
        {open && (
          <FloatingFocusManager context={context}>
            <div
              {...getFloatingProps({
                className: classNames(
                  "new-tooltip",
                  tooltipClassNames[placement]
                ),
                ref: floating,
                style: {
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                },
              })}
            >
              {children}
              <div
                ref={arrowRef}
                className={classNames(
                  "new-tooltip-arrow",
                  arrowClassNames[placement]
                )}
                style={arrowStyles({ x: arrowX, y: arrowY, placement })}
              ></div>
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
};

const isValidTrigger = (node: React.ReactNode) => {
  if (Children.count(node) !== 1) {
    return false;
  }
  if (!node || typeof node !== "object") {
    return false;
  }
  if (!("type" in node) || !node.type || node.type === React.Fragment) {
    return false;
  }
  return true;
};

const arrowClassNames: { [Key in Placement]: string } = {
  bottom: "new-tooltip-arrow-bottom",
  "bottom-end": "new-tooltip-arrow-bottom",
  "bottom-start": "new-tooltip-arrow-bottom",
  left: "new-tooltip-arrow-left",
  "left-end": "new-tooltip-arrow-left",
  "left-start": "new-tooltip-arrow-left",
  right: "new-tooltip-arrow-right",
  "right-end": "new-tooltip-arrow-right",
  "right-start": "new-tooltip-arrow-right",
  top: "new-tooltip-arrow-top",
  "top-end": "new-tooltip-arrow-top",
  "top-start": "new-tooltip-arrow-top",
};

const tooltipClassNames: { [Key in Placement]: string } = {
  bottom: "new-tooltip-bottom",
  "bottom-end": "new-tooltip-bottom",
  "bottom-start": "new-tooltip-bottom",
  left: "new-tooltip-left",
  "left-end": "new-tooltip-left",
  "left-start": "new-tooltip-left",
  right: "new-tooltip-right",
  "right-end": "new-tooltip-right",
  "right-start": "new-tooltip-right",
  top: "new-tooltip-top",
  "top-end": "new-tooltip-top",
  "top-start": "new-tooltip-top",
};

type ArrowStylesProps = {
  x: number | null | undefined;
  y: number | null | undefined;
  placement: Placement;
};
const arrowStyles = ({ x, y, placement }: ArrowStylesProps): CSSProperties => {
  // So where's that JS pattern matching proposal again?
  let cssProperty;
  if (placement.startsWith("top")) {
    cssProperty = "bottom";
  } else if (placement.startsWith("bottom")) {
    cssProperty = "top";
  } else if (placement.startsWith("left")) {
    cssProperty = "right";
  } else {
    cssProperty = "left";
  }

  if (typeof x === "number") {
    return {
      left: x,
      [cssProperty]: -20,
    };
  } else if (typeof y === "number") {
    return {
      top: y,
      [cssProperty]: -20,
    };
  }
  return {
    [cssProperty]: -20,
  };
};
