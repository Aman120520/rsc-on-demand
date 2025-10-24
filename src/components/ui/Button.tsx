import { Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  label: string;
  buttonStyles?: string;
  labelStyles?: string;
  onPress: () => void;
}

const Button = ({ label, buttonStyles, labelStyles, onPress }: ButtonProps) => {
  const defaultButtonStyles =
    "px-5 py-5 rounded-sm bg-buttonColor items-center ";
  const defaultTextStyles =
    "text-center text-buttonTextColor text-md text-white w-[100%]";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${defaultButtonStyles} ${buttonStyles}`}
    >
      <Text numberOfLines={1} className={`${defaultTextStyles} ${labelStyles}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
