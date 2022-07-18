function calculateWorkHour(listWork) {

}

module.exports = {
    blocks: [],
    block: 0,
    start: null,
    end: null,
    blockTime: null,
    init: false,
    new(blockTime, start = undefined, end = undefined) {
        if (!blockTime) {
            throw new TypeError("initiate error, blockTime is not set")
        }
        this.blocks = [];
        this.block = 0;
        this.blockTime = blockTime;
        if (!start) {
            this.start = new Date().setHours(0, 0, 0, 0);
        } else {
            this.start = new Date(start).getTime();
        }
        if (!end) {
            const today = new Date();
            this.end = new Date(today.setDate(today.getDate() + 1)).setHours(0, 0, 0, 0);
        } else {
            this.end = new Date(end).getTime();
        }
        this.init = true;
        return this;
    },
    timeSheetToBlocks(timeSheet) {
        if (!this.init) {
            throw new TypeError("not initiated yet")
        }
        const totalBlocks = 24 * 60 / this.blockTime;
        let timeSheetIndex = 0;
        // run from 1-> 8 to create 1 bytes
        for (let i = 1; i <= totalBlocks; i++) {
            const mod = i % 8;
            const nextTime = this.start + i * this.blockTime * 60 * 1000;
            if (!timeSheet[timeSheetIndex]) {
                // free block
                this.updateBlocks(mod, 0);
                continue
            }
            const workStart = new Date(timeSheet[timeSheetIndex].from).getTime();
            if (nextTime <= workStart) {
                // free block
                this.updateBlocks(mod, 0);
                continue
            }
            this.updateBlocks(mod, Math.pow(2, 8 - (mod || 8)));
            const workEnd = new Date(timeSheet[timeSheetIndex].to).getTime();
            if (nextTime >= workEnd) {
                timeSheetIndex++;
            }
        }

        return this.blocks;
    },
    updateBlocks(mod, value) {
        this.block += value;
        if (!mod) {//last time in block
            this.blocks.push(this.block);
            this.block = 0;
        }
    }
}