/* eslint-disable */

import { Project2Class } from "./module2";
import { PROJECT_COMMON_EXPORT } from "../../subprojectCommon/subproject331/src/module1";

export const PROJECT2_EXPORT: number = 2 + PROJECT_COMMON_EXPORT;

export const PROJECT2_EXPORT2: Project2Class = new Project2Class(2, 2);
