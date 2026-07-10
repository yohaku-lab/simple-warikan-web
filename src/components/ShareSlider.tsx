const PRESETS = [50, 60, 70];

interface Props {
  value: number;
  onChange: (percent: number) => void;
  partnerName: string;
}

/** Self-share picker: a 0-100 slider plus quick presets, always showing both sides'
 * percentages explicitly so it's never ambiguous which number is "mine". */
export function ShareSlider({ value, onChange, partnerName }: Props) {
  return (
    <div>
      <div className="share-readout">
        自分 {value}% / {partnerName} {100 - value}%
      </div>
      <input
        type="range"
        className="share-slider"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="自分の負担割合"
      />
      <div className="share-presets">
        {PRESETS.map((percent) => (
          <button
            key={percent}
            type="button"
            className={`chip-button${value === percent ? " active" : ""}`}
            onClick={() => onChange(percent)}
          >
            自分{percent}%
          </button>
        ))}
      </div>
    </div>
  );
}
