import { Component1 } from './component1/component1';
import { C2 } from './component2/component2';
import { MyService } from './my-service';

function run() {
    let service = new MyService();
    let component1 = new Component1(service.getModel1());
    let component2 = new C2(5, service.getModel2());
    component1.render();
    component2.render();
}