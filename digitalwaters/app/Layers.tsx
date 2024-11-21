import React from "react";
import {Checkbox} from "@nextui-org/react";

export default function Layers() {
  const [colorSelected, setColorSelected] = React.useState(false);
  const [tempSelected, setTempSelected] = React.useState(false);
  const [weatherSelected, setWeahterSelected] = React.useState(false);


  return (
    <div className="flex flex-row gap-2 justify-center">
    <p>Select Layers: </p>
      <Checkbox isSelected={colorSelected} onValueChange={setColorSelected}>
        Water Color
      </Checkbox>
      <Checkbox isSelected={tempSelected} onValueChange={setTempSelected}>
        Water temperature
      </Checkbox>
      <Checkbox isSelected={weatherSelected} onValueChange={setWeahterSelected}>
        Weather
      </Checkbox>
    </div>
  );
}
