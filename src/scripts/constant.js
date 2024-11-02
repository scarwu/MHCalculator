/**
 * Constant
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

export const langs = {
    zhTW: '正體中文',
    jaJP: '日本語',
    enUS: 'English'
}

export const wilds = {}

export const rise = {
    equipTypes: [
        'weapons',
        'helm',
        'chest',
        'arm',
        'waist',
        'leg',
        'petalace',
        'charm'
    ],
    weaponTypes: [
        'greatSword',
        'longSword',
        'swordAndShield',
        'dualBlades',
        'hammer',
        'huntingHorn',
        'lance',
        'gunlance',
        'switchAxe',
        'chargeBlade',
        'insectGlaive',
        'lightBowgun',
        'heavyBowgun',
        'bow'
    ],
    armorTypes: [
        'helm',
        'chest',
        'arm',
        'waist',
        'leg'
    ],
    sharpnessSteps: [
        'red',
        'orange',
        'yellow',
        'green',
        'blue',
        'white',
        'purple'
    ],
    resistanceTypes: [
        'fire',
        'water',
        'thunder',
        'ice',
        'dragon'
    ],
    sharpnessMultiple: {
        physical: {
            red: 0.50,
            orange: 0.75,
            yellow: 1.00,
            green: 1.05,
            blue: 1.2,
            white: 1.32,
            purple: 1.39
        },
        element: {
            red: 0.25,
            orange: 0.50,
            yellow: 0.75,
            green: 1.00,
            blue: 1.0625,
            white: 1.125,
            purple: 1.2
        }
    },
    elementCriticalMultipl: {
        attack: {
            greatSword: [1.50, 1.70],
            longSword: [1.35, 1.55],
            swordAndShield: [1.35, 1.55],
            dualBlades: [1.35, 1.55],
            hammer: [1.50, 1.70],
            huntingHorn: [1.50, 1.70],
            lance: [1.35, 1.55],
            gunlance: [1.35, 1.55],
            switchAxe: [1.35, 1.55],
            chargeBlade: [1.35, 1.55],
            insectGlaive: [1.35, 1.55],
            lightBowgun: [1.25, 1.40],
            heavyBowgun: [1.50, 1.70],
            bow: [1.35, 1.55]
        },
        status: {
            greatSword: [1.40, 1.60],
            longSword: [1.20, 1.40],
            swordAndShield: [1.20, 1.40],
            dualBlades: [1.20, 1.40],
            hammer: [1.40, 1.60],
            huntingHorn: [1.40, 1.60],
            lance: [1.20, 1.40],
            gunlance: [1.20, 1.40],
            switchAxe: [1.20, 1.40],
            chargeBlade: [1.20, 1.40],
            insectGlaive: [1.20, 1.40],
            lightBowgun: [1.20, 1.40],
            heavyBowgun: [1.40, 1.60],
            bow: [1.20, 1.40]
        }
    },
    defaultAlgorithmParams: {
        limit: 10,
        sort: 'complex', // complex | defense | amount | slot | expectedValue | expectedLevel
        order: 'desc', // asc | desc
        usingFactor: {

            // Armor Rare
            'armor:rare:7': true,
            'armor:rare:6': true,
            'armor:rare:5': false,
            'armor:rare:4': false,
            'armor:rare:3': false,
            'armor:rare:2': false,
            'armor:rare:1': false,

            // Decoration Size
            'decoration:size:4': true,
            'decoration:size:3': true,
            'decoration:size:2': true,
            'decoration:size:1': true
        }
    },
    defaultCustomWeapon: {
        id: 'customWeapon',
        rare: 7,
        type: 'greatSword',
        series: null,
        name: 'customWeapon',
        attack: 100,
        criticalRate: 0,
        defense: 0,
        sharpness: {
            value: 350,
            steps: {
                red: 0,
                orange: 0,
                yellow: 0,
                green: 0,
                blue: 0,
                white: 400,
                purple: 0
            }
        },
        element: {
            attack: {
                type: null,
                value: null
            },
            status: {
                type: null,
                value: null
            }
        },
        slots: [
            {
                size: null
            },
            {
                size: null
            },
            {
                size: null
            }
        ],
        rampageSkill: {
            amount: 3
        }
    },
    defaultCustomCharm: {
        id: 'customCharm',
        name: 'customCharm',
        slots: [
            {
                size: null
            },
            {
                size: null
            },
            {
                size: null
            }
        ],
        skills: [
            {
                id: null,
                level: null
            },
            {
                id: null,
                level: null
            }
        ]
    },
    defaultPlayerEquips: {
        weapon: {
            id: null,
            decorationIds: [],
            rampageDecorationId: null,
            rampageSkillIds: [],
            custom: defaultCustomWeapon
        },
        helm: {
            id: null,
            decorationIds: []
        },
        chest: {
            id: null,
            decorationIds: []
        },
        arm: {
            id: null,
            decorationIds: []
        },
        waist: {
            id: null,
            decorationIds: []
        },
        leg: {
            id: null,
            decorationIds: []
        },
        petalace: {
            id: null
        },
        charm: {
            id: null,
            decorationIds: [],
            custom: defaultCustomCharm
        }
    },
    defaultPlayerStatus: {
        usingItem: {
            'powerCharm': true, // 力量護符
            'powerTalon': true, // 力量之爪
            'armorCharm': true, // 守護護符
            'armorTalon': true // 守護之爪
        }
    },
    defaultStatus: {
        health: 100,
        stamina: 100,
        attack: 0,
        critical: {
            rate: 0,
            multiple: {
                positive: 1.25,
                nagetive: 0.75
            }
        },
        sharpness: null,
        element: {
            attack: null,
            status: null
        },
        elementCriticalMultiple: {
            attack: 1,
            status: 1
        },
        defense: 1,
        resistance: {
            fire: 0,
            water: 0,
            thunder: 0,
            ice: 0,
            dragon: 0
        },
        sets: [],
        skills: []
    },
    defaultBenefitAnalysis: {
        physicalAttack: 0,
        physicalCriticalAttack: 0,
        physicalExpectedValue: 0,
        elementAttack: 0,
        elementExpectedValue: 0,
        expectedValue: 0,
        perNRawAttackExpectedValue: 0,
        perNRawCriticalRateExpectedValue: 0,
        perNRawCriticalMultipleExpectedValue: 0,
        perNElementAttackExpectedValue: 0
    },
    defaultRequiredConditions: {
        equips: defaultPlayerEquips,
        sets: [],
        skills: []
    }
}

export const world = {
    resistances: [
        'fire',
        'water',
        'thunder',
        'ice',
        'dragon'
    ],
    weaponTypes: [
        'greatSword',
        'longSword',
        'swordAndShield',
        'dualBlades',
        'hammer',
        'huntingHorn',
        'lance',
        'gunlance',
        'switchAxe',
        'chargeBlade',
        'insectGlaive',
        'lightBowgun',
        'heavyBowgun',
        'bow'
    ],
    armorTypes: [
        'helm',
        'chest',
        'arm',
        'waist',
        'leg'
    ],
    sharpnessMultiple: {
        physical: {
            red:    0.50,
            orange: 0.75,
            yellow: 1.00,
            green:  1.05,
            blue:   1.2,
            white:  1.32,
            purple: 1.39
        },
        element: {
            red:    0.25,
            orange: 0.50,
            yellow: 0.75,
            green:  1.00,
            blue:   1.0625,
            white:  1.125,
            purple: 1.2
        }
    },
    elementCriticalMultiple: {
        attack: {
            greatSword:     [ 1.50, 1.70 ],
            longSword:      [ 1.35, 1.55 ],
            swordAndShield: [ 1.35, 1.55 ],
            dualBlades:     [ 1.35, 1.55 ],
            hammer:         [ 1.50, 1.70 ],
            huntingHorn:    [ 1.50, 1.70 ],
            lance:          [ 1.35, 1.55 ],
            gunlance:       [ 1.35, 1.55 ],
            switchAxe:      [ 1.35, 1.55 ],
            chargeBlade:    [ 1.35, 1.55 ],
            insectGlaive:   [ 1.35, 1.55 ],
            lightBowgun:    [ 1.25, 1.40 ],
            heavyBowgun:    [ 1.50, 1.70 ],
            bow:            [ 1.35, 1.55 ]
        },
        status: {
            greatSword:     [ 1.40, 1.60 ],
            longSword:      [ 1.20, 1.40 ],
            swordAndShield: [ 1.20, 1.40 ],
            dualBlades:     [ 1.20, 1.40 ],
            hammer:         [ 1.40, 1.60 ],
            huntingHorn:    [ 1.40, 1.60 ],
            lance:          [ 1.20, 1.40 ],
            gunlance:       [ 1.20, 1.40 ],
            switchAxe:      [ 1.20, 1.40 ],
            chargeBlade:    [ 1.20, 1.40 ],
            insectGlaive:   [ 1.20, 1.40 ],
            lightBowgun:    [ 1.20, 1.40 ],
            heavyBowgun:    [ 1.40, 1.60 ],
            bow:            [ 1.20, 1.40 ]
        }
    },
    weaponMultiple: {
        greatSword:     4.8,
        longSword:      3.3,
        swordAndShield: 1.4,
        dualBlades:     1.4,
        hammer:         5.2,
        huntingHorn:    4.2,
        lance:          2.3,
        gunlance:       2.3,
        switchAxe:      3.5,
        chargeBlade:    3.6,
        insectGlaive:   3.1,
        lightBowgun:    1.3,
        heavyBowgun:    1.5,
        bow:            1.2
    },
    default: {
        algorithmParams: {
            limit: 10,
            sort: 'complex', // complex | defense | amount | slot | expectedValue | expectedLevel
            order: 'desc', // asc | desc
            usingFactor: {
                armor: {
                    'rare12': true,
                    'rare11': false,
                    'rare10': false,
                    'rare9': false,
                    'rare8': false,
                    'rare7': false,
                    'rare6': false,
                    'rare5': false
                },
                charm: {},
                jewel: {
                    'size4': true,
                    'size3': true,
                    'size2': true,
                    'size1': true
                }
            }
        },
        candidateEquip: {
            id: null,
            type: null,
            defense: 0,
            resistance: {
                fire: 0,
                water: 0,
                thunder: 0,
                ice: 0,
                dragon: 0
            },
            skillLevelMapping: {},
            setId: null,
            slotCountMapping: {
                1: 0,
                2: 0,
                3: 0,
                4: 0
            },
            totalExpectedValue: 0,
            totalExpectedLevel: 0,
            skillExpectedValue: 0,
            skillExpectedLevel: 0
        },
        bundle: {
            equipIdMapping: {
                weapon: null,
                helm: null,
                chest: null,
                arm: null,
                waist: null,
                leg: null,
                charm: null
            },
            skillLevelMapping: {},
            setCountMapping: {},
            slotCountMapping: {
                1: 0,
                2: 0,
                3: 0,
                4: 0
            },
            jewelPackages: [],
            meta: {
                equipCount: 0,
                defense: 0,
                resistance: {
                    fire: 0,
                    water: 0,
                    thunder: 0,
                    ice: 0,
                    dragon: 0
                },
                completedSkills: {},
                completedSets: {},
                remainingSlotCountMapping: {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    all: 0
                },
                totalExpectedValue: 0,
                totalExpectedLevel: 0,
                skillExpectedValue: 0,
                skillExpectedLevel: 0
            }
        },
        equips: {
            weapon: {
                id: null,
                enhances: {},
                slotIds: []
            },
            helm: {
                id: null,
                slotIds: []
            },
            chest: {
                id: null,
                slotIds: []
            },
            arm: {
                id: null,
                slotIds: []
            },
            waist: {
                id: null,
                slotIds: []
            },
            leg: {
                id: null,
                slotIds: []
            },
            charm: {
                id: null
            }
        },
        customWeapon: {
            id: 'customWeapon',
            rare: 12,
            type: 'greatSword',
            series: null,
            name: 'customWeapon',
            attack: 100,
            criticalRate: 0,
            defense: 0,
            sharpness: {
                value: 350,
                steps: {
                    red: 0,
                    orange: 0,
                    yellow: 0,
                    green: 0,
                    blue: 0,
                    white: 0,
                    purple: 400
                }
            },
            element: {
                attack: null,
                status: null
            },
            elderseal: null,
            slots: [],
            skills: [],
            set: null
        },
        status: {
            health: 100,
            stamina: 100,
            attack: 15, // 力量護符+6 力量之爪+9
            critical: {
                rate: 0,
                multiple: {
                    positive: 1.25,
                    nagetive: 0.75
                }
            },
            sharpness: null,
            element: {
                attack: null,
                status: null
            },
            elementCriticalMultiple: {
                attack: 1,
                status: 1
            },
            elderseal: null,
            defense: 31, // 守護護符+10 守護之爪+20
            resistance: {
                fire: 0,
                water: 0,
                thunder: 0,
                ice: 0,
                dragon: 0
            },
            sets: [],
            skills: []
        },
        benefitAnalysis: {
            physicalAttack: 0,
            physicalCriticalAttack: 0,
            physicalExpectedValue: 0,
            elementAttack: 0,
            elementExpectedValue: 0,
            expectedValue: 0,
            perNRawAttackExpectedValue: 0,
            perNRawCriticalRateExpectedValue: 0,
            perNRawCriticalMultipleExpectedValue: 0,
            perNElementAttackExpectedValue: 0
        }
    }
}

export default {
    langs,
    wilds,
    rise,
    world
}
