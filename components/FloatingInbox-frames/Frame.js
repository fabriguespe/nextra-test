const Frame = ({ info, handleClick, frameButtonUpdating }) => {
  const { buttons, image, title } = info;

  // Define styles
  const styles = {
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
    },
    button: {
      flex: 1,
      // Assuming a margin of 4px between buttons for visual separation
      marginRight: "4px",
      backgroundColor: "white",
      border: "0px",
    },
    imageFrame: {
      width: "300px",
      minWidth: "300px",
    },
    firstButton: {
      marginLeft: 0,
    },
    lastButton: {
      marginRight: 0,
    },
  };

  return (
    <>
      <img src={image} alt={title} style={styles.imageFrame} />
      <div style={styles.buttonContainer}>
        {buttons?.map((button, index) => {
          if (!button) {
            return null;
          }
          const handlePress = () => handleClick(index + 1);
          const buttonStyle = {
            ...styles.button,
            ...(index === 0 ? styles.firstButton : {}),
            ...(index === buttons.length - 1 ? styles.lastButton : {}),
          };
          return (
            <button
              key={button}
              onClick={handlePress}
              disabled={frameButtonUpdating === index + 1}
              style={buttonStyle}
            >
              {button}
            </button>
          );
        })}
      </div>
    </>
  );
};
const BUTTON_PREFIX = "fc:frame:button:";
const IMAGE_PREFIX = "fc:frame:image";
const POST_URL_PREFIX = "fc:frame:post_url";
const TITLE_PREFIX = "og:title";

const getFrameInfo = (extractedTags) => {
  const buttons = [];
  let image = "";
  let postUrl = "";
  let title = "";
  for (const key in extractedTags) {
    if (key.startsWith(BUTTON_PREFIX)) {
      const buttonIndex = parseInt(key.replace(BUTTON_PREFIX, ""), 10);
      buttons[buttonIndex] = extractedTags[key];
    }
    if (key.startsWith(IMAGE_PREFIX)) {
      image = extractedTags[key];
    }
    if (key.startsWith(POST_URL_PREFIX)) {
      postUrl = extractedTags[key];
    }
    if (key.startsWith(TITLE_PREFIX)) {
      title = extractedTags[key];
    }
  }
  return {
    buttons,
    image,
    postUrl,
    title,
  };
};

export { Frame, getFrameInfo };
