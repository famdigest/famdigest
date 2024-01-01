import { Button, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { IconClock12 } from "@tabler/icons-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Keyboard } from "swiper/modules";
import { Swiper as SwiperInstance, SwiperOptions } from "swiper/types";
import dayjs from "dayjs";

export const TimePicker = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> & {
    onChange?: (val: string) => void;
  }
>(function TimePicker(props, _ref) {
  const { defaultValue, value, placeholder, onChange } = props;
  const [time, setTime] = useState(() => {
    if (defaultValue || value) {
      return dayjs((defaultValue || value) as string);
    }
    return dayjs().hour(8).minute(0);
  });

  const onHourChange = useCallback(
    (next: string) => {
      const nextNum = Number(next);
      const ampm = time.format("a");
      const newTime = time.hour(ampm === "pm" ? nextNum + 12 : nextNum);
      setTime(newTime);
      onChange?.(newTime.format());
    },
    [time]
  );

  const onMinuteChange = useCallback(
    (next: string) => {
      const nextNum = Number(next);
      const newTime = time.minute(nextNum);
      setTime(newTime);
      onChange?.(newTime.format());
    },
    [time]
  );

  const onAmPmChange = useCallback(
    (next: string) => {
      const getNewTime = () => {
        const currentHour = time.hour();
        if (next === "am" && currentHour >= 12) {
          return time.subtract(12, "hour");
        } else if (next === "pm" && currentHour < 12) {
          return time.add(12, "hour");
        }
        return time;
      };
      const newTime = getNewTime();
      setTime(newTime);
      onChange?.(newTime.format());
    },
    [time]
  );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <IconClock12 size={20} className="mr-2 text-muted-foreground" />
            <span>{value ? time.format("h:mm a") : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[180px] p-0">
          <div className="grid grid-cols-3 gap-x-1.5">
            <Hours
              selected={time.format("h")}
              onChange={(val) => onHourChange(val)}
            />
            <Minutes
              selected={time.format("mm")}
              onChange={(val) => onMinuteChange(val)}
            />
            <AmPm
              selected={time.format("a")}
              onChange={(val) => onAmPmChange(val)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
});

const timePickerSlotProps: Partial<SwiperOptions> = {
  modules: [FreeMode, Keyboard],
  slidesPerView: 3,
  freeMode: {
    enabled: true,
    sticky: true,
    momentumRatio: 0.25,
    momentumVelocityRatio: 0.25,
    minimumVelocity: 0.1,
  },
  keyboard: {
    enabled: false,
  },
  loop: true,
  direction: "vertical",
  slideToClickedSlide: true,
  centeredSlides: true,
};
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = ["00", "15", "30", "45"];
const amPm = ["am", "pm"];

function Hours({
  selected,
  onChange,
}: {
  selected?: string;
  onChange: (val: string) => void;
}) {
  const [swiper, setSwiper] = useState<SwiperInstance>();
  const index = hours.findIndex((h) => String(h) === selected);

  return (
    <div
      autoFocus
      tabIndex={0}
      onFocus={() => swiper?.keyboard?.enable()}
      onBlur={() => swiper?.keyboard?.disable()}
    >
      <Swiper
        className="h-24 w-full"
        {...timePickerSlotProps}
        keyboard={{
          enabled: true,
        }}
        initialSlide={index > -1 ? index : 6}
        onSlideChange={(swiper) => {
          onChange(`${hours[swiper.realIndex]}`);
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
      >
        {hours.map((h) => (
          <SwiperSlide key={h} className="h-8 flex items-center justify-center">
            {h}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function Minutes({
  selected,
  onChange,
}: {
  selected?: string;
  onChange: (val: string) => void;
}) {
  const [swiper, setSwiper] = useState<SwiperInstance>();
  const index = minutes.findIndex((h) => String(h) === selected);
  return (
    <div
      tabIndex={0}
      onFocus={() => swiper?.keyboard?.enable()}
      onBlur={() => swiper?.keyboard?.disable()}
    >
      <Swiper
        className="h-24 w-full"
        {...timePickerSlotProps}
        initialSlide={index > -1 ? index : 0}
        onSlideChange={(swiper) => {
          onChange(`${minutes[swiper.realIndex]}`);
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
      >
        {minutes.map((m) => (
          <SwiperSlide key={m} className="h-8 flex items-center justify-center">
            {m}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function AmPm({
  selected,
  onChange,
}: {
  selected?: string;
  onChange: (val: string) => void;
}) {
  const [swiper, setSwiper] = useState<SwiperInstance>();
  const index = amPm.findIndex((h) => String(h) === selected);

  useEffect(() => {
    const index = amPm.findIndex((h) => String(h) === selected);
    if (swiper && swiper.activeIndex !== index) {
      swiper.slideTo(index);
    }
  }, [selected]);

  return (
    <div
      tabIndex={0}
      onFocus={() => swiper?.keyboard?.enable()}
      onBlur={() => swiper?.keyboard?.disable()}
    >
      <Swiper
        className="h-24 w-full"
        {...timePickerSlotProps}
        initialSlide={index > -1 ? index : 0}
        loop={false}
        onSlideChange={(swiper) => {
          onChange(`${amPm[swiper.realIndex]}`);
        }}
        onSwiper={(swiper) => setSwiper(swiper)}
      >
        {amPm.map((m) => (
          <SwiperSlide key={m} className="h-8 flex items-center justify-center">
            {m}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
