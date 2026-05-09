export class Route {
    constructor({id = '', name = '', estimatedTime = null, frequency = null} = {}) {
        this.id = id;
        this.name = name;
        this.estimatedTime = estimatedTime;
        this.frequency = frequency;
    }
}

