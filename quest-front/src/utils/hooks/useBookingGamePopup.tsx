import React from "react";
import { createPortal } from "react-dom";
import Popup from "../../pages/GameDetail/components/Popup";

const portalElement = document.getElementById("portal");

export function useBookingGamePopup(maxPlayersCount: number, isOpen: boolean) {
  if (!isOpen || !portalElement) return null;
  return createPortal(<Popup maxPlayersCount={maxPlayersCount} />, portalElement);
}
