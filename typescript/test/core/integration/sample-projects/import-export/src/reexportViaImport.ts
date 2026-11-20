import { CustomClass2 } from "./source2";
import { CustomInterface3 as ImportedInterface3 } from "./source3";
import DefaultClass2 from "./source2";
import { valueFunction } from "./values";
import { say } from "cowsay";

class LocalClass {}

export { CustomClass2, ImportedInterface3 as ReexportedInterface3, valueFunction, say, LocalClass };
export default DefaultClass2;
