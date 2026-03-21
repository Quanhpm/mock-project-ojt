import React from "react";
import { Route } from "react-router-dom";
import { CLIENT_MENU } from "./Client.menu";

/**
 * ClientRoutes - Old legacy routes
 * NOTE: Hiện tại đã chuyển sang sử dụng HomePrivateRoutes
 * File này có thể được xóa nếu không còn sử dụng CLIENT_MENU
 */
export const ClientRoutes = (
  <Route path="/legacy">
    {CLIENT_MENU.map((item) => (
      <Route key={item.path} path={item.path} element={<item.component />} />
    ))}
  </Route>
);
