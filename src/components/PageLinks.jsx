import { pageLinks } from "../helpers/GolfConsts";

const PageLinks = (props) => {
    const { activePage, setActivePage } = props;

    return (
        <div className="pageLinks marginTopMedium marginBottomExtraSmall">
            {pageLinks.map((page, i) => {
                return <a key={i} onClick={() => setActivePage(page)} className={`marginRightExtraLarge cursorPointer pageLinkFont${page === activePage? " active" : ""}`}>{page}</a>
            })}
        </div>
    )
}

export default PageLinks