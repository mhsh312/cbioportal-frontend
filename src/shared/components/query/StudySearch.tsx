import {
    addClauses,
    removePhrase,
    toQueryString,
} from 'shared/lib/query/textQueryUtils';
import * as React from 'react';
import { FunctionComponent } from 'react';
import {
    SearchClause,
    QueryUpdate,
} from 'shared/components/query/filteredSearch/SearchClause';
import { QueryParser } from 'shared/lib/query/QueryParser';
import _ from 'lodash';
import { SearchBox } from 'shared/components/query/filteredSearch/SearchBox';
import { StudySearchControls } from 'shared/components/query/filteredSearch/StudySearchControls';
import { observer, useLocalObservable } from 'mobx-react-lite';

export type StudySearchProps = {
    parser: QueryParser;
    query: SearchClause[];
    onSearch: (query: SearchClause[]) => void;
};

export const StudySearch: FunctionComponent<StudySearchProps> = observer(
    function(props) {
        const store = useLocalObservable(() => ({
            isMenuOpen: false,
            toggle() {
                this.isMenuOpen = !this.isMenuOpen;
            },
            setMenuOpen(visible: boolean) {
                this.isMenuOpen = visible;
            },
        }));

        const onFocusSearchBox = () => {
            store.setMenuOpen(true);
        };

        return (
            <div
                data-test="study-search"
                className={`dropdown ${store.isMenuOpen ? 'open' : ''}`}
            >
                <div className="input-group input-group-sm input-group-toggle">
                    <SearchBox
                        queryString={toQueryString(props.query)}
                        onType={(update: string) =>
                            handleQueryTyping(props, update)
                        }
                        onFocus={onFocusSearchBox}
                    />
                    <SearchMenuToggle
                        onClick={store.toggle}
                        open={store.isMenuOpen}
                    />
                </div>
                <ClearSearchButton
                    show={props.query.length > 0}
                    onClick={() => handleQueryTyping(props, '')}
                />
                <StudySearchControls
                    query={props.query}
                    filterConfig={props.parser.searchFilters}
                    onChange={(update: QueryUpdate) =>
                        handleQueryUpdate(props, update)
                    }
                    parser={props.parser}
                />
            </div>
        );
    }
);

function handleQueryTyping(props: StudySearchProps, update: string) {
    const updatedQuery = props.parser.parseSearchQuery(update);
    return props.onSearch(updatedQuery);
}

function handleQueryUpdate(props: StudySearchProps, update: QueryUpdate) {
    let updatedQuery = _.cloneDeep(props.query);
    if (update.toRemove) {
        for (const p of update.toRemove) {
            updatedQuery = removePhrase(p, updatedQuery);
        }
    }
    if (update.toAdd) {
        updatedQuery = addClauses(update.toAdd, updatedQuery);
    }
    props.onSearch(updatedQuery);
}

const SearchMenuToggle: FunctionComponent<{
    onClick: () => void;
    open: boolean;
}> = props => {
    const arrowDirection = props.open ? 'rotate(180deg)' : 'rotate(0deg)';
    return (
        <span className="input-group-btn">
            <button
                type="button"
                className="dropdown-toggle btn btn-sm btn-default"
                onClick={props.onClick}
            >
                <span className="caret" style={{ transform: arrowDirection }}>
                    &nbsp;
                </span>
            </button>
        </span>
    );
};

const ClearSearchButton: FunctionComponent<{
    onClick: () => void;
    show: boolean;
}> = props => {
    return (
        <span
            data-test="clearStudyFilter"
            onClick={props.onClick}
            style={{
                visibility: props.show ? 'visible' : 'hidden',
                position: 'absolute',
                right: '37px',
                top: '3px',
                zIndex: 10,
                fontSize: '18px',
                cursor: 'pointer',
                color: 'grey',
            }}
        >
            x
        </span>
    );
};
