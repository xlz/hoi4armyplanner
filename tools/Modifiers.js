import assert from 'assert';


//weather
  acclimatization_cold_climate_gain_factor
  acclimatization_hot_climate_gain_factor
acclimatization_cold_climate_gain_factor
acclimatization_hot_climate_gain_factor
winter_attrition_factor
heat_attrition_factor

//air
  air_attack: ,
air_superiority_bonus_in_combat: camouflage_expert,
army_bonus_air_superiority_factor: air_chief_ground_support_1, air_land_battle, logistical_bombing, offensive_formations, combat_unit_destruction, battlefield_support, operational_destruction
cas_damage_reduction: camouflage_expert
enemy_army_bonus_air_superiority_factor: forest, hills, mountain, urban, jungle, army_concealment_1

//ap_attack
  ap_attack

//defense/defence
  breakthrough
  defence
  defense
  hardness
army_armor_defence_factor: army_armored_1, panzer_expert
army_artillery_defence_factor: army_artillery_1
army_core_defence_factor
army_defence_factor: army_chief_defensive_1
army_infantry_defence_factor: army_infantry_1, infantry_leader
cavalry_defence_factor: army_cavalry_1, cavalry_expert
defence
mechanized_defence_factor: ditto
motorized_defence_factor: ditto
special_forces_defence_factor: army_commando_1

//casualty
  casualty_trickleback:
  experience_loss_factor:
recon_factor: trickster
recon_factor_while_entrenched: ambusher

//combat_width
  combat_width

//capture
  equipment_capture_factor
equipment_capture: scavenger

//naval invasion
amphibious_invasion_defence

//terrain
  forest
  fort
  jungle
  mountain
  river
  urban
desert
forest
fort
hills
jungle
marsh
mountain
plains
river
urban
terrain_penalty_reduction

//reinforce
  initiative
  land_reinforce_rate
land_reinforce_rate

//entrenchment
  entrenchment
  max_dig_in_factor: defensive_doctrine
dig_in_speed_factor: army_entrenchment_1, trench_warfare, guerilla_fighter
max_dig_in: trench_warfare, defence_in_depth, old_guard, ambusher

//org
  max_organisation
  org_loss_when_moving
  army_morale_factor
  default_morale
army_morale_factor
army_org
army_org_Factor
army_org_factor
army_org_regain
org_loss_when_moving

//planning
  max_planning
max_planning
planning_speed
  planning_speed

//attack
  hard_attack
  soft_attack
army_armor_attack_factor
army_artillery_attack_factor
army_attack_factor
army_core_attack_factor
army_infantry_attack_factor
cavalry_attack_factor
land_night_attack
mechanized_attack_factor
motorized_attack_factor
special_forces_attack_factor
shore_bombardment_bonus

//speed
  maximum_speed
army_armor_speed_factor
army_speed_factor

//attrition
  reliability_factor
  supply_consumption_factor
attrition
extra_marine_supply_grace
extra_paratrooper_supply_grace
no_supply_grace
out_of_supply_factor
special_forces_no_supply_grace
special_forces_out_of_supply_factor
supply_consumption_factor

//suppression
  suppression_factor

//general
attack_skill
defense_skill
logistics_skill
max_command_power
planning_skill

//elec
decryption
decryption_factor
encryption

// politics
conscription
consumer_goods_factor
enable_tactic
justify_war_goal_time
political_power_factor

//industry
equipment_conversion_speed
global_building_slots_factor
industrial_capacity_dockyard
industrial_capacity_factory
industry_air_damage_factor
industry_repair_factor
line_change_production_efficiency_factor
local_resources_factor
min_export
nuclear_production
production_factory_efficiency_gain_factor
production_factory_max_efficiency_factor
production_factory_start_efficiency_factor
production_speed_buildings_factor
research_time_factor
stability_factor
static_anti_air_damage_factor
static_anti_air_hit_chance_factor


// org: army_org(template) army_org_factor(template)
// recovery: army_org_regain(dynamic) army_morale_factor(template)
// supply: supply_consumption_factor(template)
// attack
// defense:
// entrenchment: max_dig_in(dynamic)
// speed: army_speed_factor
