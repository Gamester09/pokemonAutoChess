import React, { useState } from "react"
import ReactTooltip from "react-tooltip";
import PRECOMPUTED_TYPE_POKEMONS_ALL from "../../../../../models/precomputed/type-pokemons-all.json"
import {
  SynergyName,
  SynergyDetail,
  SynergyDescription
} from "../../../../../types/strings/Synergy"
import { EffectName } from "../../../../../types/strings/Effect"
import { TypeTrigger, RarityColor } from "../../../../../types/Config"
import { Synergy } from "../../../../../types/enum/Synergy"
import { Pkm, PkmFamily } from "../../../../../types/enum/Pokemon"
import { getPortraitSrc } from "../../../utils"
import SynergyIcon from "../icons/synergy-icon"
import { EffectDescriptionComponent } from "../synergy/effect-description"
import { GamePokemonDetail } from "../game/game-pokemon-detail"
import PokemonFactory from "../../../../../models/pokemon-factory";
import { groupBy, deduplicateArray } from "../../../../../utils/array";
import { Pokemon } from "../../../../../models/colyseus-models/pokemon";
import { Rarity } from "../../../../../types/enum/Game";
import { addIconsToDescription } from "../../utils/descriptions";

export default function WikiType(props: { type: Synergy | "all" }) {
  const [hoveredPokemon, setHoveredPokemon] = useState<Pokemon>();

  let pokemonsNames: Pkm[]
  if(props.type === "all"){
    pokemonsNames = deduplicateArray(Object.values(PRECOMPUTED_TYPE_POKEMONS_ALL).flat()) as Pkm[]
  } else {
    pokemonsNames = PRECOMPUTED_TYPE_POKEMONS_ALL[props.type] as Pkm[]
  }

  const pokemons = pokemonsNames.map(p => PokemonFactory.createPokemonFromName(p))
    .sort((a,b) => a.stars - b.stars) // put first stage first
    .filter((a, index, list) => {
      if(a.rarity === Rarity.SUMMON) return true // show all summons even in the same family

      // remove if already one member of family in the list
      return list.findIndex(b => PkmFamily[a.name] === PkmFamily[b.name]) === index
    }) 
    
  const pokemonsPerRarity = groupBy(pokemons, p => p.rarity)
  return (
    <div style={{padding: "1em"}}>
      {props.type !== "all" && (<>
        <h2><SynergyIcon type={props.type} /> {SynergyName[props.type].eng}</h2>
        <p>{addIconsToDescription(SynergyDescription[props.type].eng)}</p>
        {SynergyDetail[props.type].map((effect, i) => {
          return (
            <div key={EffectName[effect]} style={{ display: "flex" }}>
              <p>
                ({TypeTrigger[props.type][i]}) {EffectName[effect]}:&nbsp;
              </p>
              <EffectDescriptionComponent effect={effect} />
            </div>
          )
        })}
      </>)}
      <table>
        <tbody>
        {(Object.values(Rarity) as Rarity[]).map(rarity => {
          return <tr key={rarity}>
            <td style={{ color: RarityColor[rarity] }}>{rarity}</td>
            <td>{(pokemonsPerRarity[rarity] ?? []).map(p => {
              return <img key={p.name} src={getPortraitSrc(p.index)} alt={p.name} title={p.name}
                data-tip data-for="pokemon-detail"
                onMouseOver={() => {
                  setHoveredPokemon(p)
                }} />})}
            </td>
          </tr>
        })}
        </tbody>
      </table>
      {hoveredPokemon && <ReactTooltip
        id="pokemon-detail"
        className="customeTheme game-pokemon-detail-tooltip"
        effect="float"
        place="bottom"
        offset={{ bottom: 20 }}
      >
        <GamePokemonDetail pokemon={hoveredPokemon} />
      </ReactTooltip>}
    </div>
  )
}
