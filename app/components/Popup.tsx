import Link from "next/link";

export const PopUp = () => {
  return (
    <div className="popup">
      <p>
        To continue interact with AI please{" "}
        <Link className="link" href="/auth">
          sign in
        </Link>
      </p>
    </div>
  );
};
