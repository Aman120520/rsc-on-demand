import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import Modal from "react-native-modal";
import { SvgXml } from "react-native-svg";
import { COLORS } from "@/src/styles/colors";
import { STYLES } from "@/src/styles/common";
import { TEXT_STYLE } from "@/src/styles/typography";
import { CLOSE_SMALL } from "@/src/icons/svg";
import CheckoutCalendar from "./CheckoutCalendar";
import { colors } from "@/src/styles/theme";
import { useAppConfig } from "@/src/context/ConfigProvider";
import { useTranslation } from "react-i18next";

interface DatePickerModalProps {
  type: string;
  open: boolean;
  setOpen: Function;
  calendarData: any;
  date: any;
  setDate: Function;
  time: any;
  setTime?: Function;
  showTimeSlotsInCalendar?: boolean;
}

const DatePickerModal = ({
  type,
  open,
  setOpen,
  calendarData,
  date,
  setDate,
  time,
  setTime,
  showTimeSlotsInCalendar = true,
}: DatePickerModalProps) => {
  const { appConfig } = useAppConfig();
  const { t } = useTranslation();

  // Temporary state to hold selected date and time
  const [tempDate, setTempDate] = useState(date);
  const [tempTime, setTempTime] = useState(time);

  const handleSelect = () => {
    setDate(tempDate);
    setTime?.(tempTime);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      backdropColor={COLORS.BLACK.d0}
      isVisible={open}
      style={styles.modal}
    >
      <View style={[styles.container]}>
        <Pressable style={styles.header} onPress={handleClose}>
          <Text style={[TEXT_STYLE.TEXT_16_SB, { color: "#000000" }]}>
            {`${t("common.choose")} ${type} ${t("common.date_and_time")}`}
          </Text>
          <SvgXml xml={CLOSE_SMALL} height={15} width={15} />
        </Pressable>

        <CheckoutCalendar
          data={calendarData}
          selectedDate={tempDate}
          setSelectedDate={setTempDate}
          selectedTime={tempTime}
          setSelectedTime={setTempTime}
          showTimeSlots={showTimeSlotsInCalendar}
        />
        <View style={[STYLES.flexColCC]}>
          <Pressable
            onPress={handleSelect}
            className="bg-buttonColor"
            style={[
              styles.btn,
              // { backgroundColor: colors.primaryColor },
              // { backgroundColor: appConfig.primaryColor ?? colors?.primaryColor },
            ]}
          >
            <Text style={[TEXT_STYLE.TEXT_15_B, { color: COLORS.WHITE.d0 }]}>
              {t("common.select")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default DatePickerModal;

const styles = StyleSheet.create({
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    height: "auto",
    borderRadius: 8,
    backgroundColor: COLORS.WHITE.d0,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btn: {
    width: 180,
    height: 46,
    // backgroundColor: colors.buttonColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    marginTop: 10,
  },
});
