import {randomNumBetween} from './utils';

export default class Asteroid {
    constructor(args) {
        this.position = args.position;
        this.velocity = {
            x: randomNumBetween(-1.5, 1.5),
            y: randomNumBetween(-1.5, 1.5),
        }

        console.log("New asteroid created");
    }

    destroy(){
        this.delete = true;
    }

    render(state) {

    }
}