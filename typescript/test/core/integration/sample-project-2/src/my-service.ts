import { Model1 } from './component1/component1.model';
import { Model2 } from './component2/component2.model';
import { service } from './framework';

@service
export class MyService {

    getModel1(): Model1 {
        return new Model1();
    }

    postModel1(model: Model1): void {
        console.log("Posting Model1: " + model.x + model.y);
    }

    getModel2(): Model2 {
        return new Model2();
    }
}