import React, { useState } from 'react';
import TextTruncate from 'react-text-truncate';

export interface TeacherItemProps {
  headPhoto: string;
  name: string;
  intro: string;
  courseText: string;
  courseCount: number;
  more: string;
}

export default function TeacherItem(props: TeacherItemProps): JSX.Element {
  const { headPhoto, name, intro, courseText, courseCount, more } = props;
  const [fold, setFold] = useState<boolean>(true);
  return (
    <div className="teacher-item">
      <div className="teacher-avatar">
        <img alt="teacher-avatar" src={headPhoto} />
      </div>
      <div className="teacher-content">
        <div className="tacher-name">{name}</div>
        <div className="teacher-desc">
          {fold ? (
            <TextTruncate
              line={3}
              element="span"
              truncateText="…"
              text={intro}
              textTruncateChild={(
                <span
                  className="more"
                  tabIndex={0}
                  role="button"
                  onKeyDown={() => {}}
                  onClick={() => {
                    setFold(false);
                  }}
                >
                  {more}
                </span>
              )}
            />
          ) : (
            <span>{intro}</span>
          )}
        </div>
        <div className="teacher-field">
          <div className="field-icon">
            <img src="images/icon_course.png" alt="icon-course" />
          </div>
          <div className="field">
            <div className="filed-title">{courseText}</div>
            <div className="filed-value">{courseCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
