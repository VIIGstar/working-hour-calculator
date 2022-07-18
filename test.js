const assert = require('assert');
const index = require('./index')
describe('timeSheetToBlocks #1', function () {
    it('update block by mod', function (){
        const updateBlocks = (mod) => {
            const value = Math.pow(2, 8 - (mod || 8))
            return index.new(15).updateBlocks(mod % 8, value);
        }
        updateBlocks(1);
        assert.equal(index.block, 128);
        updateBlocks(2);
        assert.equal(index.block, 64);
        // reset block
        updateBlocks(8 % 8);
        assert.equal(index.block, 0);
        // next block
        updateBlocks(9 % 8);
        assert.equal(index.block, 128);
    })

    it('simple check block', function () {
        const instance = index.new(15);
        const work = {
            from: new Date(new Date().setHours(0, 15, 0, 0)),
            to: new Date(new Date().setHours(3, 15, 0, 0)), // 3h
        };

        // check first block only
        const blocks = instance.timeSheetToBlocks([work]);
        // 0 1 1 1 1 1 1 1 : 1h45
        // 1 1 1 1 1 0 0 0: 1h15
        assert.equal(blocks[0], 127);
        assert.equal(blocks[1], 248);
    });

    it('work from zero', function () {
        const work = {
            from: new Date(new Date().setHours(0, 0, 0, 0)),
            to: new Date(new Date().setHours(0, 45, 0, 0)), // 3h
        };
        const instance = index.new(15)
        // check first block only
        const blocks = instance.timeSheetToBlocks([work]);
        // 1 1 1 0 0 0 0 0 : 45ph
        assert.equal(blocks[0], 224);
    });


    it('check working 2 order', function () {
        const instance = index.new(15);
        // 0 1 1 1 0 0 1 1 | 1 1 0 0 0 0 0 0
        const works = [
            {
                from: new Date(new Date().setHours(0, 15, 0, 0)),
                to: new Date(new Date().setHours(1, 0, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 30, 0, 0)),
                to: new Date(new Date().setHours(2, 30, 0, 0)),
            },
        ];

        const blocks = instance.timeSheetToBlocks(works, 15);
        assert.equal(blocks[0], 115);
        assert.equal(blocks[1], 192);
    });

    it('check working 2 artists', function () {
        // 0 1 1 1 0 0 1 1 | 1 1 0 0 0 0 0 0
        const works1 = [
            {
                from: new Date(new Date().setHours(0, 15, 0, 0)),
                to: new Date(new Date().setHours(1, 0, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 30, 0, 0)),
                to: new Date(new Date().setHours(2, 30, 0, 0)),
            },
        ];

        // 0 1 0 1 1 1 1 1 | 1 0 0 0 0 0 0 0
        const works2 = [
            {
                from: new Date(new Date().setHours(0, 15, 0, 0)),
                to: new Date(new Date().setHours(0, 30, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(0, 45, 0, 0)),
                to: new Date(new Date().setHours(1, 30, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 30, 0, 0)),
                to: new Date(new Date().setHours(2, 15, 0, 0)),
            },
        ];

        let instance = index.new(15);
        const blocks1 = instance.timeSheetToBlocks(works1, 15);
        assert.equal(blocks1[0], 115);
        assert.equal(blocks1[1], 192);
        instance = index.new(15);
        const blocks2 = instance.timeSheetToBlocks(works2, 15);
        assert.equal(blocks2[0], 95);
        assert.equal(blocks2[1], 128);

        const freeTime = [];
        for (let i = 0; i < blocks1.length; i++) {
            freeTime.push(blocks1[i] & blocks2[i]);
        }

        assert.equal(freeTime[0], 83);
        assert.equal(freeTime[1], 128);
    });

    it('check working 4 artists', function () {
        // 0 1 1 1 0 0 1 1 | 1 1 0 0 0 0 0 0
        const works1 = [
            {
                from: new Date(new Date().setHours(0, 15, 0, 0)),
                to: new Date(new Date().setHours(1, 0, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 30, 0, 0)),
                to: new Date(new Date().setHours(2, 30, 0, 0)),
            },
        ];

        // 0 1 0 1 1 1 1 1 | 1 0 0 0 0 0 0 0
        const works2 = [
            {
                from: new Date(new Date().setHours(0, 15, 0, 0)),
                to: new Date(new Date().setHours(0, 30, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(0, 45, 0, 0)),
                to: new Date(new Date().setHours(1, 30, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 30, 0, 0)),
                to: new Date(new Date().setHours(2, 15, 0, 0)),
            },
        ];

        // 0 0 0 1 0 0 0 1 | 1 0 0 0 0 0 0 1
        const works3 = [
            {
                from: new Date(new Date().setHours(0, 45, 0, 0)),
                to: new Date(new Date().setHours(1, 0, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 45, 0, 0)),
                to: new Date(new Date().setHours(2, 15, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(3, 45, 0, 0)),
                to: new Date(new Date().setHours(4, 0, 0, 0)),
            },
        ];

        // 0 0 0 1 1 0 0 1 | 1 0 0 0 0 0 0 1
        const works4 = [
            {
                from: new Date(new Date().setHours(0, 45, 0, 0)),
                to: new Date(new Date().setHours(1, 15, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(1, 45, 0, 0)),
                to: new Date(new Date().setHours(2, 15, 0, 0)),
            },
            {
                from: new Date(new Date().setHours(3, 45, 0, 0)),
                to: new Date(new Date().setHours(4, 0, 0, 0)),
            },
        ];

        let instance = index.new(15);
        const artist1 = instance.timeSheetToBlocks(works1, 15);
        assert.equal(artist1[0], 115);
        assert.equal(artist1[1], 192);

        instance = index.new(15);
        const artist2 = instance.timeSheetToBlocks(works2, 15);
        assert.equal(artist2[0], 95);
        assert.equal(artist2[1], 128);

        instance = index.new(15);
        const artist3 = instance.timeSheetToBlocks(works3, 15);
        assert.equal(artist3[0], 17);
        assert.equal(artist3[1], 129);

        instance = index.new(15);
        const artist4 = instance.timeSheetToBlocks(works4, 15);
        assert.equal(artist4[0], 25);
        assert.equal(artist4[1], 129);

        // 0 1 1 1 0 0 1 1 | 1 1 0 0 0 0 0 0
        // 0 1 0 1 1 1 1 1 | 1 0 0 0 0 0 0 0
        // 0 0 0 1 0 0 0 1 | 1 0 0 0 0 0 0 1
        // 0 0 0 1 1 0 0 1 | 1 0 0 0 0 0 0 1
        const freeTime = [];
        const artists = [artist1, artist2, artist3, artist4];
        for (let i = 0; i < artists[0].length; i++) {
            let rs = 255;
            for (let aIndex = 0; aIndex < artists.length; aIndex++) {
                rs = rs & artists[aIndex][i]
            }
            freeTime.push(rs);
        }

        assert.equal(freeTime[0], 17);
        assert.equal(freeTime[1], 128);
    });
});