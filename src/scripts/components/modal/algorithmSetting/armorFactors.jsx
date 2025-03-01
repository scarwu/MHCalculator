/**
 * Algorithm Setting: Armor Factors
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/misc'
import ArmorDataset from '@/scripts/libraries/dataset/armor'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load States
import States from '@/scripts/states'

export default function ArmorFactors (props) {
    const {segment, byRequiredConditions} = props

    /**
     * Hooks
     */
    const _algorithmParams = States.hooks.useAlgorithmParams()
    const _requiredConditions = States.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: AlgorithmSetting -> ArmorFactors')

        let armorList = (true === byRequiredConditions)
            ? Misc.getArmorListByRequiredConditions(_requiredConditions)
            : ArmorDataset.getList()
        let armorSeriesMapping = {}

        armorList.filter((armorItem) => {
            let text = _(armorItem.series)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((armorItem) => {
            if (false === _algorithmParams.usingFactor['armor:rare:' + armorItem.rare]) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorItem.rare])) {
                armorSeriesMapping[armorItem.rare] = {}
            }

            armorSeriesMapping[armorItem.rare][armorItem.seriesId] = {
                name: armorItem.series
            }
        })

        if (0 === Object.keys(armorSeriesMapping).length) {
            return false
        }

        return Object.keys(armorSeriesMapping).sort((rareA, rareB) => {
            return rareA > rareB ? 1 : -1
        }).map((rare) => {
            let seriesIds = Object.keys(armorSeriesMapping[rare]).sort((seriesIdA, seriesIdB) => {
                return _(seriesIdA) > _(seriesIdB) ? 1 : -1
            })

            if (0 === seriesIds.length) {
                return false
            }


            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(seriesIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={rare + '_' + blockIndex} className="mhc-item mhc-item-2-step">
                        <div className="col-12 mhc-name">
                            <span>{_('armorFactor')}: R{rare}</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {seriesIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((seriesId) => {
                                let isInclude = Helper.isNotEmpty(_algorithmParams.usingFactor['armor:series:' + seriesId])
                                    ? _algorithmParams.usingFactor['armor:series:' + seriesId] : true

                                return (
                                    <div key={seriesId} className="col-6 mhc-value">
                                        <span>{_(armorSeriesMapping[rare][seriesId].name)}</span>
                                        <div className="mhc-icons_bundle">
                                            {isInclude ? (
                                                <IconButton
                                                    iconName="star" altName={_('exclude')}
                                                    onClick={() => {
                                                        States.actions.setAlgorithmParamsUsingFactor('armor:series:' + seriesId, false)
                                                    }} />
                                            ) : (
                                                <IconButton
                                                    iconName="star-o" altName={_('include')}
                                                    onClick={() => {
                                                        States.actions.setAlgorithmParamsUsingFactor('armor:series:' + seriesId, true)
                                                    }} />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            }

            return blocks
        })
    }, [
        segment,
        byRequiredConditions,
        _algorithmParams,
        _requiredConditions
    ])
}
